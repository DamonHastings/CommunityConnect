class NotificationPolicy < ApplicationPolicy
  def index? = user.present?
  def update? = record.user_id == user.id
  def read_all? = user.present?
end
