class Api::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    authorize Notification
    notifications = current_user.notifications.recent.limit(20)
    unread_count = current_user.notifications.unread.count

    render json: {
      notifications: notifications.map { |n| serialize(n) },
      unread_count: unread_count
    }
  end

  def update
    notification = current_user.notifications.find(params[:id])
    authorize notification
    notification.mark_read!
    render json: { notification: serialize(notification) }
  end

  def read_all
    authorize Notification, :read_all?
    current_user.notifications.unread.update_all(read_at: Time.current)
    head :no_content
  end

  private

  def serialize(n)
    NotificationSerializer.new(n).serializable_hash[:data][:attributes].merge(id: n.id)
  end
end
