import React from "react";

const UserManagementPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h2>
      <p className="mt-4 text-gray-600">
        Burada kullanıcıları listeleyebilir, düzenleyebilir veya silebilirsiniz.
      </p>
    </div>
  );
};

export default UserManagementPage;
