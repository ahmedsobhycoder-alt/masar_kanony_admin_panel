import ResourceTable from "../../components/ResourceTable";
import { deleteFloorName, getFloorNames, updateFloorName } from "../../api/adminResources";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Floor name", flex: 1, minWidth: 200 },
];

export default function FloorNames() {
  return (
    <ResourceTable
      title="Floor Names"
      subtitle="Browse the available floor labels"
      getPage={getFloorNames}
      columns={columns}
      crud={{
        update: updateFloorName,
        remove: deleteFloorName,
        fields: [{ name: "name", label: "Floor name" }],
      }}
    />
  );
}