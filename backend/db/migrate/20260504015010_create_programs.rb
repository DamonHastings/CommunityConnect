class CreatePrograms < ActiveRecord::Migration[8.1]
  def change
    create_table :programs do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.text :goals
      t.integer :program_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.integer :capacity
      t.string :city
      t.string :state
      t.boolean :remote, null: false, default: false
      t.datetime :application_opens_at
      t.datetime :application_closes_at
      t.date :starts_on
      t.date :ends_on
      t.string :contact_email
      t.timestamps
    end

    add_index :programs, :status
  end
end
