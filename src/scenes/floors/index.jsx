import ResourceTable, { displayRelatedValue } from "../../components/ResourceTable";
import { deleteFloor, getFloors, updateFloor } from "../../api/adminResources";

const columns = [
  { field: "floorName", headerName: "Floor", flex: 1, minWidth: 180 },
  {
    field: "court",
    headerName: "Court",
    flex: 1.5,
    minWidth: 220,
    valueGetter: (params) => displayRelatedValue(params.row.court),
  },
  { field: "nOfficesPerFloor", headerName: "Offices", width: 120 },
];

export default function Floors() {
  return (
    <ResourceTable
      title="Floors"
      subtitle="Browse floors by court"
      getPage={getFloors}
      columns={columns}
      crud={{
        update: updateFloor,
        remove: deleteFloor,
        fields: [{ name: "floorName", label: "Floor name" }],
      }}
    />
  );
}