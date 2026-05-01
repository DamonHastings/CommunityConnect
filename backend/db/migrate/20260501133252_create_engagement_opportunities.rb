class CreateEngagementOpportunities < ActiveRecord::Migration[8.1]
  def change
    create_table :engagement_opportunities do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.integer :opportunity_type
      t.integer :status
      t.boolean :remote
      t.date :start_date
      t.date :end_date
      t.text :requirements
      t.string :contact_email

      t.timestamps
    end
  end
end
