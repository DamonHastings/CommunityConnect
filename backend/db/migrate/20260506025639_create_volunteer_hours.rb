class CreateVolunteerHours < ActiveRecord::Migration[8.1]
  def change
    create_table :volunteer_hours do |t|
      t.references :service_application, null: false, foreign_key: true
      t.decimal :hours, precision: 5, scale: 2, null: false
      t.date :date, null: false
      t.text :notes

      t.timestamps
    end
  end
end
