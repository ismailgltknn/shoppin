import { useState, useEffect, useMemo, useCallback } from "react";
import { useProducts } from "../contexts/ProductContext";
import type { Product } from "../types";

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
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import InventoryIcon from "@mui/icons-material/Inventory";

import ProductFormModal from "../components/ProductFormModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Product | "actions" | "image" | "ct_name";
  label: string;
  numeric: boolean;
  disableSorting?: boolean;
}

const headCells: HeadCell[] = [
  { id: "image", numeric: false, label: "Resim", disableSorting: true },
  { id: "name", numeric: false, label: "Ad" },
  {
    id: "description",
    numeric: false,
    label: "Açıklama",
    disableSorting: true,
  },
  { id: "price", numeric: true, label: "Fiyat" },
  { id: "stock", numeric: true, label: "Stok" },
  { id: "ct_name", numeric: false, label: "Kategori" },
  { id: "actions", numeric: false, label: "İşlemler", disableSorting: true },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof Product>(
  order: Order,
  orderBy: Key
): (a: Product, b: Product) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const ProductManagementPage = () => {
  const {
    products,
    loading,
    error,
    totalProducts,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Product>("name");

  useEffect(() => {
    fetchProducts(page, rowsPerPage);
  }, [page, rowsPerPage, fetchProducts]);

  const openAddModal = useCallback(() => {
    setCurrentProduct(null);
    setIsFormModalOpen(true);
  }, []);

  const openEditModal = useCallback((product: Product) => {
    setCurrentProduct(product);
    setIsFormModalOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setCurrentProduct(null);
  }, []);

  const openDeleteModal = useCallback((product: Product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCurrentProduct(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (productData: FormData, productId?: string | number) => {
      setIsSubmitting(true);
      let success = false;
      if (currentProduct && productId) {
        success = await updateProduct(currentProduct.id, productData);
      } else {
        success = await addProduct(productData);
      }
      setIsSubmitting(false);
      if (success) {
        closeFormModal();
        fetchProducts(page, rowsPerPage);
      }
      return success;
    },
    [
      currentProduct,
      updateProduct,
      addProduct,
      closeFormModal,
      fetchProducts,
      page,
      rowsPerPage,
    ]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (currentProduct) {
      const success = await deleteProduct(currentProduct.id);
      if (success) {
        closeDeleteModal();
        const newTotalProducts = totalProducts - 1;
        const newPage =
          newTotalProducts > 0 && products.length === 1 && page > 0
            ? Math.max(0, page - 1)
            : page;

        setPage(newPage);
        if (newPage === page) {
          fetchProducts(page, rowsPerPage);
        }
      }
    }
  }, [
    currentProduct,
    deleteProduct,
    closeDeleteModal,
    totalProducts,
    products.length,
    page,
    fetchProducts,
    rowsPerPage,
  ]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: keyof Product) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const sortableHeadCell = headCells.find(
      (cell) => cell.id === orderBy && !cell.disableSorting
    );
    if (!sortableHeadCell || sortableHeadCell.disableSorting) {
      return products;
    }

    return stableSort(products, getComparator(order, orderBy));
  }, [products, order, orderBy]);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-4">
        <CircularProgress size={40} color="primary" />
        <Typography variant="h6" color="text.secondary" className="mt-2">
          Ürünler yükleniyor...
        </Typography>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center p-3 min-h-screen py-4">
        <Typography variant="h5" color="error" className="mb-2">
          Ürünler yüklenirken bir hata oluştu.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchProducts(page, rowsPerPage)}
          startIcon={<RefreshIcon />}
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <Box
      className="p-4 sm:p-6 bg-white shadow-lg flex flex-col min-h-screen"
      sx={{ minHeight: "calc(100vh - 100px)" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Typography variant="h5" component="h2" className="font-bold">
          Ürün Yönetimi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openAddModal}
          className="w-full sm:w-auto"
        >
          Yeni Ürün Ekle
        </Button>
      </div>

      {error && products.length > 0 && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}

      {totalProducts === 0 && !loading ? (
        <div className="text-center p-6 text-gray-500 flex flex-col justify-center items-center flex-grow">
          <InventoryIcon className="text-6xl mb-4" />
          <Typography variant="h6">Henüz hiç ürün bulunmuyor.</Typography>
        </div>
      ) : (
        <Paper className="w-full mb-4 shadow-sm flex flex-col flex-grow">
          <TableContainer
            sx={{
              flexGrow: 1,
              maxHeight: "calc(100vh - 380px)",
              minHeight: "680px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              overflow: "auto",
            }}
          >
            <Table stickyHeader aria-label="ürün yönetimi tablosu" size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f5f5f5",
                    "& th": {
                      fontWeight: "bold",
                      color: "#333",
                      borderBottom: "2px solid #e0e0e0",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id as string}
                      align={headCell.numeric ? "right" : "left"}
                      padding="normal"
                      className="p-2 sm:p-3"
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{
                        backgroundColor: "inherit",
                      }}
                    >
                      {headCell.disableSorting ? (
                        headCell.label
                      ) : (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : "asc"}
                          onClick={(event) =>
                            handleRequestSort(
                              event,
                              headCell.id as keyof Product
                            )
                          }
                        >
                          {headCell.label}
                          {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === "desc"
                                ? "azalan düzende"
                                : "artan düzende"}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      className="p-2 sm:p-3"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">
                          Yok
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-2 sm:p-3">{product.name}</TableCell>
                    <TableCell className="p-2 sm:p-3">
                      <Tooltip
                        title={product.description}
                        placement="top-start"
                        arrow
                      >
                        <Typography variant="body2">
                          {product.description.length > 50
                            ? `${product.description.substring(0, 50)}...`
                            : product.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="p-2 sm:p-3">
                      {parseFloat(product.price).toFixed(2)} TL
                    </TableCell>
                    <TableCell className="p-2 sm:p-3">
                      {product.stock}
                    </TableCell>
                    <TableCell className="p-2 sm:p-3">
                      {product.ct_name}
                    </TableCell>
                    <TableCell align="right" className="p-2 sm:p-3">
                      <IconButton
                        aria-label="düzenle"
                        onClick={() => openEditModal(product)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="sil"
                        onClick={() => openDeleteModal(product)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 12, 25, 50]}
            component="div"
            count={totalProducts}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına ürün:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to === -1 ? count : to} / ${
                count !== -1 ? count : `yaklaşık ${to}`
              }`
            }
          />
        </Paper>
      )}

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        initialData={currentProduct}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={currentProduct ? currentProduct.name : ""}
      />
    </Box>
  );
};

export default ProductManagementPage;
