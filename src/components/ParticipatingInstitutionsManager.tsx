import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export function ParticipatingInstitutionsManager() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"college" | "university" | "company">("college");
  const [logo, setLogo] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<Id<"participatingInstitutions"> | null>(null);

  const institutions = useQuery(api.participatingInstitutions.listInstitutions, {});
  const createInstitution = useMutation(api.participatingInstitutions.createInstitution);
  const updateInstitution = useMutation(api.participatingInstitutions.updateInstitution);
  const deleteInstitution = useMutation(api.participatingInstitutions.deleteInstitution);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      void updateInstitution({ id: editingId, name, type, logo, isActive });
      setEditingId(null);
    } else {
      void createInstitution({ name, type, logo, isActive });
    }
    setName("");
    setType("college");
    setLogo("");
    setIsActive(true);
  };

  const handleEdit = (institution: Doc<"participatingInstitutions">) => {
    setEditingId(institution._id);
    setName(institution.name);
    setType(institution.type);
    setLogo(institution.logo || "");
    setIsActive(institution.isActive);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Participating Institutions</h2>
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-2"
            />
            <label>Is Active</label>
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          {editingId ? "Update" : "Add"} Institution
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
              setType("college");
              setLogo("");
              setIsActive(true);
            }}
            className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Logo</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions?.map((inst: Doc<"participatingInstitutions">) => (
              <tr key={inst._id}>
                <td className="p-2 border">{inst.name}</td>
                <td className="p-2 border">{inst.type}</td>
                <td className="p-2 border">
                  {inst.logo && <img src={inst.logo} alt={inst.name} className="w-10 h-10" />}
                </td>
                <td className="p-2 border">{inst.isActive ? "Active" : "Inactive"}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEdit(inst)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">
                    Edit
                  </button>
                  <button
                    onClick={() => void deleteInstitution({ id: inst._id })}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
