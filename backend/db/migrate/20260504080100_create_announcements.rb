class CreateAnnouncements < ActiveRecord::Migration[8.1]
  def change
    create_table :announcements do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body, null: false
      t.datetime :published_at
      t.timestamps
    end
    add_index :announcements, [:organization_id, :published_at]
  end
end
