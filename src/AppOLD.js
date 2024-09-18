import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newUser, setNewUser] = useState({
    FirstName: "",
    LastName: "",
    EmailAddress: "",
  });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users?page=${currentPage}&perPage=10`
      );
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/users", newUser);
      setNewUser({ FirstName: "", LastName: "", EmailAddress: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          name="FirstName"
          value={newUser.FirstName}
          onChange={(e) => handleInputChange(e, setNewUser)}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="LastName"
          value={newUser.LastName}
          onChange={(e) => handleInputChange(e, setNewUser)}
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="EmailAddress"
          value={newUser.EmailAddress}
          onChange={(e) => handleInputChange(e, setNewUser)}
          placeholder="Email Address"
          required
        />
        <button type="submit">Create User</button>
      </form>
      <h2>Users List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.FirstName} {user.LastName} - {user.EmailAddress}
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
