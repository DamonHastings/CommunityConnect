class CreateServiceApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :service_applications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :engagement_opportunity, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.text :message
      t.text :notes
      t.timestamps
    end

    add_index :service_applications, [:user_id, :engagement_opportunity_id],
              unique: true,
              name: "index_service_applications_on_user_and_opportunity"
  end
end
