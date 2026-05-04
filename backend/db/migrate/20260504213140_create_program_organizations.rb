class CreateProgramOrganizations < ActiveRecord::Migration[8.1]
  def change
    create_table :program_organizations do |t|
      t.references :program, null: false, foreign_key: true
      t.references :organization, null: false, foreign_key: true
      t.integer :role, null: false, default: 0

      t.timestamps
    end

    add_index :program_organizations, [:program_id, :organization_id], unique: true
  end
end
