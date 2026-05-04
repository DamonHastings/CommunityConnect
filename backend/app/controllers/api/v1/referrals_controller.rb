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
      render json: { referral: serialize_one(referral) }, status: :created
    else
      render json: { errors: referral.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    referral = Referral.includes(:referring_org, :referred_user, :target).find(params[:id])
    authorize referral
    if referral.update(status: params[:status])
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
end
