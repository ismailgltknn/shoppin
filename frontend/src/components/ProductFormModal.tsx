import React, { useState, useEffect } from "react";
import type { Product } from "../types";
import { toast } from "react-hot-toast";
import type { SelectChangeEvent } from "@mui/material/Select";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import axiosInstance from "../api/axiosInstance";
// import { LARAVEL_APP_URL } from "../api/config";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  borderRadius: 0,
  boxShadow: 24,
  p: 4,
  outline: "none",
};

interface Category {
  id: number;
  name: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    productData: FormData,
    productId?: string | number
  ) => Promise<boolean>;
  initialData?: Product | null;
  isSubmitting: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");
  const [categoryId, setCategoryId] = useState<number | string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
        toast.error("Kategoriler yüklenemedi.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setDescription(initialData.description || "");
        setPrice(parseFloat(initialData.price));
        setStock(initialData.stock);
        setCategoryId(initialData.category_id || "");
      } else {
        // Yeni ürün ekleme modunda state'leri sıfırla
        setName("");
        setSlug("");
        setDescription("");
        setPrice("");
        setStock("");
        setCategoryId("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !description ||
      !slug ||
      price === "" ||
      stock === "" ||
      categoryId === ""
    ) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("stock", String(stock));
    formData.append("category_id", String(categoryId));

    if (isEditMode) {
      formData.append("_method", "PUT");
    }

    const productId = initialData?.id;
    const success = await onSubmit(formData, productId);
    if (success) {
      onClose();
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<number | string>) => {
    setCategoryId(Number(event.target.value));
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={modalStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          {isEditMode ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Ürün Adı"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Etiket"
            variant="outlined"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Açıklama"
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Fiyat (TL)"
              variant="outlined"
              type="number"
              value={price}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (Number(value) >= 0 && !isNaN(Number(value)))
                ) {
                  setPrice(value);
                }
              }}
              margin="normal"
              required
              slotProps={{
                input: {
                  inputProps: {
                    step: "0.01",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Stok"
              variant="outlined"
              type="number"
              value={stock}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (Number(value) >= 0 && !isNaN(Number(value)))
                ) {
                  setStock(value);
                }
              }}
              margin="normal"
              required
            />
          </Box>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="category-select-label">Kategori</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={categoryId}
              label="Kategori"
              onChange={handleCategoryChange}
              disabled={isLoadingCategories}
            >
              {isLoadingCategories ? (
                <MenuItem disabled>
                  <CircularProgress size={20} /> Kategoriler Yükleniyor...
                </MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

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
              disabled={isSubmitting || isLoadingCategories}
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

export default ProductFormModal;
