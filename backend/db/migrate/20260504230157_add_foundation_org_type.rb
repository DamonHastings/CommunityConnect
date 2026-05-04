class AddFoundationOrgType < ActiveRecord::Migration[8.1]
  def up
    # org_type is an integer enum: nonprofit=0, business=1, school=2, foundation=3
    # No schema change needed — the column already exists as integer with a default.
    # We just document the new value here so it's tracked in migration history.
  end

  def down
    # Reset any foundation orgs to nonprofit (0) if rolling back
    execute "UPDATE organizations SET org_type = 0 WHERE org_type = 3"
  end
end
