class CreatePartnerConnections < ActiveRecord::Migration[8.1]
  def change
    create_table :partner_connections do |t|
      t.references :requester_org, null: false, foreign_key: { to_table: :organizations }
      t.references :target_org, null: false, foreign_key: { to_table: :organizations }
      t.integer :status, null: false, default: 0
      t.text :message

      t.timestamps
    end

    add_index :partner_connections, [:requester_org_id, :target_org_id], unique: true
  end
end
