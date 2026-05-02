class CreateUserIntakeResponses < ActiveRecord::Migration[8.1]
  def change
    create_table :user_intake_responses do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.integer :housing_status, null: false, default: 0
      t.integer :employment_status, null: false, default: 0
      t.string :needs_categories, array: true, default: []
      t.integer :urgency, null: false, default: 0
      t.text :goals
      t.text :barriers
      t.string :preferred_contact

      t.timestamps
    end
  end
end
