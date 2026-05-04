class CreateProgramApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :program_applications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :program, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.text :message
      t.text :notes
      t.timestamps
    end

    add_index :program_applications, [:user_id, :program_id], unique: true
  end
end
