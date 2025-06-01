import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

// MUI Iconlar
import LocalMall from "@mui/icons-material/LocalMall";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import axiosInstance from "../api/axiosInstance";

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalOrders: number;
  totalUsers: number;
  recentOrdersLast7Days: number;
  totalInventoryValue: number;
}

const PanelDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<DashboardStats>(
          "/admin/dashboard/stats"
        );
        setStats(response.data);
      } catch (err) {
        console.error("İstatistikler çekilirken hata oluştu:", err);
        setError(
          "İstatistikler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{ mb: 4, fontWeight: "bold", color: "text.primary" }}
      >
        Yönetim Paneli Genel Bakış
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <AlertTitle>Hata!</AlertTitle>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "1fr 1fr 1fr",
              xl: "1fr 1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* Yükleme durumu */}
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              sx={{
                height: 120,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: 3,
              }}
            >
              <CircularProgress />
            </Card>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "1fr 1fr 1fr",
              xl: "1fr 1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* Toplam Ürünler */}
          <Card
            sx={{
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" color="text.secondary">
                  Toplam Ürünler
                </Typography>
              }
              action={<LocalMall color="primary" sx={{ fontSize: 40 }} />}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {stats?.totalProducts?.toLocaleString() || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platformdaki tüm ürünlerin sayısı
              </Typography>
            </CardContent>
          </Card>

          {/* Toplam Stok */}
          <Card
            sx={{
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" color="text.secondary">
                  Toplam Stok Adedi
                </Typography>
              }
              action={
                <ShoppingCartIcon color="success" sx={{ fontSize: 40 }} />
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {stats?.totalStock?.toLocaleString() || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tüm ürünlerin toplam stok miktarı
              </Typography>
            </CardContent>
          </Card>

          {/* Toplam Siparişler */}
          <Card
            sx={{
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" color="text.secondary">
                  Toplam Siparişler
                </Typography>
              }
              action={<ShoppingCartIcon color="info" sx={{ fontSize: 40 }} />}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {stats?.totalOrders?.toLocaleString() || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tüm zamanlardaki toplam sipariş sayısı
              </Typography>
            </CardContent>
          </Card>

          {/* Toplam Kullanıcılar */}
          <Card
            sx={{
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" color="text.secondary">
                  Toplam Kullanıcılar
                </Typography>
              }
              action={<PeopleIcon color="secondary" sx={{ fontSize: 40 }} />}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {stats?.totalUsers?.toLocaleString() || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kayıtlı aktif kullanıcı sayısı
              </Typography>
            </CardContent>
          </Card>

          {/* Son 7 Günlük Siparişler */}
          <Card
            sx={{
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" color="text.secondary">
                  Son 7 Günlük Siparişler
                </Typography>
              }
              action={<ShoppingCartIcon color="error" sx={{ fontSize: 40 }} />}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {stats?.recentOrdersLast7Days?.toLocaleString() || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Son yedi günde oluşturulan sipariş sayısı
              </Typography>
            </CardContent>
          </Card>

          {/* Toplam Envanter Değeri */}
          <Card
            sx={{
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" color="text.secondary">
                  Toplam Envanter Değeri
                </Typography>
              }
              action={<AttachMoneyIcon color="warning" sx={{ fontSize: 40 }} />}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {stats?.totalInventoryValue?.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                }) || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mevcut stoktaki ürünlerin tahmini toplam değeri
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default PanelDashboardPage;
