import ResourceTable from "../../components/ResourceTable";
import { deleteCourtType, getCourtTypes, updateCourtType } from "../../api/adminResources";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Court type", flex: 1, minWidth: 180 },
  { field: "description", headerName: "Description", flex: 2, minWidth: 240 },
];

export default function CourtTypes() {
  return (
    <ResourceTable
      title="Court Types"
      subtitle="Browse court classifications"
      getPage={getCourtTypes}
      columns={columns}
      crud={{
        update: updateCourtType,
        remove: deleteCourtType,
        fields: [
          { name: "name", label: "Court type" },
          { name: "description", label: "Description", multiline: true, required: false },
        ],
      }}
    />
  );
}