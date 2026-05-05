class Api::V1::ReferralsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_organization, only: [:index, :create]

  def index
    referrals = @organization.sent_referrals.includes(:referring_org, :referred_user, :target).order(created_at: :desc)
    render json: { referrals: serialize_all(referrals) }
  end

  def create
    referred_user = find_referred_user
    return render json: { error: "User not found" }, status: :not_found unless referred_user

    referral = @organization.sent_referrals.build(
      referred_user: referred_user,
      message: params[:message],
      target_type: params[:target_type],
      target_id: params[:target_id]
    )
    authorize referral
    if referral.save
      notify_referral_received(referral)
      render json: { referral: serialize_one(referral) }, status: :created
    else
      render json: { errors: referral.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    referral = Referral.includes(:referring_org, :referred_user, :target).find(params[:id])
    authorize referral
    previous_status = referral.status
    if referral.update(status: params[:status])
      notify_referral_accepted(referral, previous_status)
      render json: { referral: serialize_one(referral) }
    else
      render json: { errors: referral.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_organization
    @organization = Organization.find(params[:organization_id])
  end

  def find_referred_user
    if params[:referred_user_email].present?
      User.find_by(email: params[:referred_user_email].strip.downcase)
    elsif params[:referred_user_id].present?
      User.find_by(id: params[:referred_user_id])
    end
  end

  def serialize_one(r)
    ReferralSerializer.new(r).serializable_hash[:data][:attributes].merge(id: r.id)
  end

  def serialize_all(referrals)
    referrals.map { |r| serialize_one(r) }
  end

  def notify_referral_received(referral)
    target_label = case referral.target_type
                   when "Program" then "the \"#{referral.target.title}\" program"
                   when "Organization" then referral.target.name
                   else "a resource"
                   end

    Notification.create!(
      user: referral.referred_user,
      notification_type: :referral_received,
      title: "You received a referral",
      body: "#{referral.referring_org.name} referred you to #{target_label}.",
      url: "/my-services",
      actor_name: referral.referring_org.name
    )
  end

  def notify_referral_accepted(referral, previous_status)
    return unless previous_status == "pending" && referral.accepted?

    referral.referring_org.organization_memberships
      .where(role: :admin)
      .includes(:user)
      .each do |membership|
        Notification.create!(
          user: membership.user,
          notification_type: :referral_accepted,
          title: "Referral accepted",
          body: "#{referral.referred_user.full_name} accepted your referral.",
          url: "/organizations/#{referral.referring_org_id}/manage",
          actor_name: referral.referred_user.full_name
        )
      end
  end
end
