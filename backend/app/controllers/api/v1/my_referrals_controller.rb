class Api::V1::MyReferralsController < ApplicationController
  before_action :authenticate_user!

  def index
    referrals = current_user.referrals
      .includes(:referring_org, :referred_user, :target)
      .order(created_at: :desc)
    render json: { referrals: referrals.map { |r| serialize(r) } }
  end

  private

  def serialize(r)
    ReferralSerializer.new(r).serializable_hash[:data][:attributes].merge(id: r.id)
  end
end
