class Announcement < ApplicationRecord
  belongs_to :organization

  after_create :notify_followers

  validates :title, presence: true
  validates :body, presence: true

  scope :published, -> { where.not(published_at: nil).where("published_at <= ?", Time.current).order(published_at: :desc) }

  def publish!
    update!(published_at: Time.current)
  end

  private

  def notify_followers
    organization.org_followers.includes(:user).each do |follower|
      Notification.create!(
        user: follower.user,
        notification_type: :new_content,
        title: "New announcement from #{organization.name}",
        body: title.truncate(100),
        url: "/organizations/#{organization.id}",
        actor_name: organization.name
      )
    end
  end
end
