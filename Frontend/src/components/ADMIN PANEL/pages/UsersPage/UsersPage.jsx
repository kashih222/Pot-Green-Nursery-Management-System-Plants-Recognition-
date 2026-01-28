import { useState, useEffect } from 'react';
import axios from "axios";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/web/users/userslist`);
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const deleteUser = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#f0fdf4",
      color: "#14532d"
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/web/userdelete/${id}`);
        setUsers(users.filter((user) => user._id !== id));
        toast.success("User deleted successfully!", {
          style: {
            border: "1px solid #22c55e",
            padding: "10px",
            color: "#14532d",
            background: "#ecfdf5",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#ecfdf5",
          },
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setIsUpdating(true);
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/web/users/${userId}/role`, {
        role: newRole
      });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      setEditingRole(null);
      toast.success("User role updated successfully!", {
        style: {
          border: "1px solid #22c55e",
          padding: "10px",
          color: "#14532d",
          background: "#ecfdf5",
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#ecfdf5",
        },
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-yellow-500 mb-6">Registered Users</h1>

      <input
        type="text"
        placeholder="Search users"
        className="mb-4 px-4 py-2 w-full border rounded-md text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow-md">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Sr.No.</th>
              <th className="py-3 px-6 text-left">Full Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id} className="border-b hover:bg-green-100">
                  <td className="py-3 px-6">{index + 1}</td>
                  <td className="py-3 px-6">{user.fullName}</td>
                  <td className="py-3 px-6">{user.email}</td>
                  <td className="py-3 px-6">
                    {editingRole === user._id ? (
                      <select
                        className="border rounded px-2 py-1 bg-white text-black"
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        <button
                          onClick={() => setEditingRole(user._id)}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={isUpdating}
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                      disabled={isUpdating}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No users registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPage;
