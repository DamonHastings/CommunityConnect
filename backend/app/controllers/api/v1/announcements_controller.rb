class Api::V1::AnnouncementsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :destroy]
  before_action :set_organization

  def index
    is_admin = current_user.present? && current_user.admin_of?(@organization)
    announcements = is_admin ? @organization.announcements.order(created_at: :desc) : @organization.announcements.published
    render json: { announcements: announcements.map { |a| serialize(a) } }
  end

  def create
    announcement = @organization.announcements.build(announcement_params)
    announcement.published_at = Time.current if params[:announcement][:publish].present?
    authorize announcement

    if announcement.save
      render json: { announcement: serialize(announcement) }, status: :created
    else
      render json: { errors: announcement.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    announcement = @organization.announcements.find(params[:id])
    authorize announcement
    announcement.destroy
    head :no_content
  end

  private

  def set_organization
    @organization = Organization.find(params[:organization_id])
  end

  def announcement_params
    params.require(:announcement).permit(:title, :body)
  end

  def serialize(announcement)
    AnnouncementSerializer.new(announcement).serializable_hash[:data][:attributes]
  end
end
