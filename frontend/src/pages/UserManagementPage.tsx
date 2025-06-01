import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  TablePagination,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";

import axiosInstance from "../api/axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Modal from "@mui/material/Modal";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
  outline: "none",
};

interface User {
  id: number;
  name: string;
  email: string;
  shipping_address: string | null;
  billing_address: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

// UserFormModal bileşeni
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  initialData?: User | null; // Ekleme durumunda null veya undefined olabilir
  isSubmitting: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [shippingAddress, setShippingAddress] = useState(
    initialData?.shipping_address || ""
  );
  const [billingAddress, setBillingAddress] = useState(
    initialData?.billing_address || ""
  );
  const [role, setRole] = useState(initialData?.role || "customer");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEditMode = !!initialData; // initialData varsa düzenleme modu

  useEffect(() => {
    if (initialData) {
      // Düzenleme modu
      setName(initialData.name);
      setEmail(initialData.email);
      setShippingAddress(initialData.shipping_address || "");
      setBillingAddress(initialData.billing_address || "");
      setRole(initialData.role);
      setPassword(""); // Düzenlerken şifre alanlarını boş bırak
      setPasswordConfirmation("");
    } else {
      // Ekleme modu
      setName("");
      setEmail("");
      setShippingAddress("");
      setBillingAddress("");
      setRole("customer"); // Yeni kullanıcı varsayılan olarak müşteri
      setPassword("");
      setPasswordConfirmation("");
    }
    setErrors({}); // Mod açıldığında veya initialData değiştiğinde hataları temizle
  }, [initialData, isOpen]); // isOpen bağımlılığı, modal her açıldığında sıfırlanmasını sağlar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const userData: Partial<User> = {
      name,
      email,
      shipping_address: shippingAddress || null,
      billing_address: billingAddress || null,
      role,
    };

    // Ekleme modunda veya şifre girildiyse şifre alanlarını ekle
    if (!isEditMode || password) {
      (userData as any).password = password;
      (userData as any).password_confirmation = passwordConfirmation;
    }

    try {
      await onSubmit(userData);
      onClose();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("Kullanıcı işlemi sırasında bir hata oluştu.");
      }
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            {isEditMode ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Adı Soyadı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name ? errors.name[0] : ""}
            />
            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email ? errors.email[0] : ""}
            />
            <TextField
              label="Gönderim Adresi"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
              error={!!errors.shipping_address}
              helperText={
                errors.shipping_address ? errors.shipping_address[0] : ""
              }
            />
            <TextField
              label="Fatura Adresi"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
              error={!!errors.billing_address}
              helperText={
                errors.billing_address ? errors.billing_address[0] : ""
              }
            />
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel id="role-select-label">Rol</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                label="Rol"
                onChange={(e: SelectChangeEvent) =>
                  setRole(e.target.value as string)
                }
              >
                <MenuItem value="customer">
                  {translateRole("customer")}
                </MenuItem>
                <MenuItem value="seller">{translateRole("seller")}</MenuItem>
                <MenuItem value="admin">{translateRole("admin")}</MenuItem>
              </Select>
              {errors.role && (
                <Typography color="error" variant="caption">
                  {errors.role[0]}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              // Ekleme modunda zorunlu, düzenleme modunda isteğe bağlı
              required={!isEditMode}
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password ? errors.password[0] : ""}
            />
            <TextField
              label="Şifre Tekrar"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              fullWidth
              // Ekleme modunda zorunlu, düzenleme modunda isteğe bağlı
              required={!isEditMode}
              autoComplete="new-password"
              error={!!errors.password_confirmation}
              helperText={
                errors.password_confirmation
                  ? errors.password_confirmation[0]
                  : ""
              }
            />
          </Stack>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : isEditMode
                ? "Güncelle"
                : "Ekle"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

const translateRole = (role: string): string => {
  switch (role) {
    case "admin":
      return "Yönetici";
    case "seller":
      return "Satıcı";
    case "customer":
      return "Müşteri";
    default:
      return role;
  }
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSelectedUser, setCurrentSelectedUser] = useState<User | null>(
    null
  ); // Ekleme için null, düzenleme için User objesi
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/admin/users`, {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
        },
      });
      setUsers(response.data.data);
      setTotalUsers(response.data.total);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      if (err.response && err.response.status === 403) {
        setError("Bu işlemi yapmaya yetkiniz yok.");
        toast.error("Yetkisiz erişim!");
      } else {
        setError("Kullanıcılar yüklenirken bir hata oluştu.");
        toast.error("Kullanıcılar yüklenemedi!");
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Yeni kullanıcı ekleme modalını açar
  const openFormModalForAdd = () => {
    setCurrentSelectedUser(null); // Yeni ekleme için null
    setIsFormModalOpen(true);
  };

  const openFormModalForEdit = (user: User) => {
    setCurrentSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentSelectedUser(null);
  };

  const openDeleteModal = (user: User) => {
    setCurrentSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentSelectedUser(null);
  };

  const handleFormSubmit = async (userData: Partial<User>) => {
    setIsSubmitting(true);
    try {
      let response;
      if (currentSelectedUser) {
        // Düzenleme Modu
        response = await axiosInstance.put(
          `/admin/users/${currentSelectedUser.id}`,
          userData
        );
        toast.success("Kullanıcı başarıyla güncellendi!");
      } else {
        // Ekleme Modu
        response = await axiosInstance.post("/admin/users", userData);
        toast.success("Kullanıcı başarıyla eklendi!");
      }

      // Eğer güncellenen/eklenen kullanıcı oturum açmış kullanıcı ise
      if (authUser && currentSelectedUser?.id === authUser.id) {
        // API'den dönen güncel user objesini kullan
        updateUser(response.data.user);

        // Rol değişikliğine göre yönlendirme yap
        if (response.data.user.role === "customer") {
          navigate("/"); // Müşteri olursa panelden çık
        } else if (response.data.user.role === "seller") {
          navigate("/panel"); // Satıcı olursa panele yönlendir
        }
        // Admin kalırsa veya diğer durumlarda yönlendirme yapma
      }
      fetchUsers(); // Kullanıcı listesini yenile
      closeFormModal();
    } catch (err: any) {
      console.error("User submission error:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentSelectedUser) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/admin/users/${currentSelectedUser.id}`);
      toast.success("Kullanıcı başarıyla silindi!");
      fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Kullanıcı silinirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Kullanıcılar yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          onClick={() => navigate("/panel")}
          startIcon={<HomeIcon />}
          sx={{ mt: 2 }}
        >
          Panel Anasayfasına Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <PersonIcon sx={{ mr: 1 }} /> Kullanıcı Yönetimi
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}>
        {/* Yeni Kullanıcı Ekle Butonu */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openFormModalForAdd}
        >
          Yeni Kullanıcı Ekle
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchUsers()}
        >
          Listeyi Yenile
        </Button>
      </Box>

      {users.length === 0 && !loading && !error ? (
        <Alert severity="info">Hiç kullanıcı bulunamadı.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table stickyHeader aria-label="user management table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Adı Soyadı</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Kayıt Tarihi</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{translateRole(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Düzenle">
                        <IconButton
                          onClick={() => openFormModalForEdit(user)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          onClick={() => openDeleteModal(user)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına kullanıcı:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to === -1 ? count : to} / ${
                count !== -1 ? count : `yaklaşık ${to}`
              }`
            }
          />
        </Paper>
      )}

      {/* UserFormModal bileşeni */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        initialData={currentSelectedUser}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={currentSelectedUser ? currentSelectedUser.name : ""}
      />
    </Box>
  );
};

export default UserManagementPage;
