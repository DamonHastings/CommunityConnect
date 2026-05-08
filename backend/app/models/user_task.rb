class UserTask < ApplicationRecord
  belongs_to :user
  belongs_to :source, polymorphic: true, optional: true

  validates :title, presence: true

  scope :incomplete, -> { where(completed: false) }
  scope :complete, -> { where(completed: true) }
  scope :by_due_date, -> { order(Arel.sql("due_date IS NULL, due_date ASC")) }

  def mark_complete!
    update!(completed: true, completed_at: Time.current)
  end
end
