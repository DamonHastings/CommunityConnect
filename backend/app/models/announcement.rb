class Announcement < ApplicationRecord
  belongs_to :organization

  validates :title, presence: true
  validates :body, presence: true

  scope :published, -> { where.not(published_at: nil).where("published_at <= ?", Time.current).order(published_at: :desc) }

  def publish!
    update!(published_at: Time.current)
  end
end
