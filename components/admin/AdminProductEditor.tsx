"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import ProductImage from "@/components/shop/ProductImage";
import { X } from "lucide-react";

import type { Product, ProductSpec } from "@/types";
import { useProducts } from "@/context/ProductsContext";
import { useToast } from "@/context/ToastContext";

interface AdminProductEditorProps {
  product: Product | null;
  onClose: () => void;
}

const EMPTY_SPEC: ProductSpec = {
  l: "",
  v: "",
};

const supabase = createClient();

export default function AdminProductEditor({
  product,
  onClose,
}: AdminProductEditorProps) {
  const { updateProduct, addProduct } =
    useProducts();

  const { showToast } = useToast();

  const isNew = product === null;

  const [isSaving, setIsSaving] =
    useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    desc: product?.desc ?? "",
    price: product ? String(product.price) : "",
    old: product?.old
      ? String(product.old)
      : "",
    stock: product
      ? String(product.stock)
      : "",
    badge: product?.badge ?? "",
    cat: product?.cat ?? "wireless",
    img: product?.img ?? "",
  });

  const [specs, setSpecs] = useState<
    ProductSpec[]
  >(
    product?.specs &&
      product.specs.length > 0
      ? product.specs
      : [{ ...EMPTY_SPEC }]
  );

 const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    showToast("Uploading image...");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      showToast("Image upload failed.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    setForm((previous) => ({
      ...previous,
      img: publicUrl,
    }));

    showToast("✓ Image uploaded successfully");
  } catch (error) {
    console.error(error);
    showToast("Image upload failed.");
  }
};

  const updateSpec = (
    index: number,
    field: keyof ProductSpec,
    value: string
  ) => {
    setSpecs((previousSpecs) =>
      previousSpecs.map((spec, i) =>
        i === index
          ? {
              ...spec,
              [field]: value,
            }
          : spec
      )
    );
  };

  const addSpec = () => {
    setSpecs((previousSpecs) => [
      ...previousSpecs,
      { ...EMPTY_SPEC },
    ]);
  };

  const removeSpec = (index: number) => {
    setSpecs((previousSpecs) =>
      previousSpecs.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleSave = async () => {
    if (isSaving) return;

    const price = Number(form.price);
    const stock = Number(form.stock);

    const old = form.old.trim()
      ? Number(form.old)
      : undefined;

    if (!form.name.trim()) {
      showToast("Product name is required");
      return;
    }

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      showToast("Enter a valid price");
      return;
    }

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      showToast("Enter a valid stock count");
      return;
    }

    const finalImg = form.img.trim() || "/images/koala.jpg";

    if (
      old !== undefined &&
      (Number.isNaN(old) || old < 0)
    ) {
      showToast(
        "Enter a valid original price"
      );
      return;
    }

    const cleanSpecs = specs
      .filter(
        (spec) =>
          spec.l.trim() &&
          spec.v.trim()
      )
      .map((spec) => ({
        l: spec.l.trim(),
        v: spec.v.trim(),
      }));

    setIsSaving(true);

    try {
      if (isNew) {
        const newProductId =
          await addProduct({
            name: form.name.trim(),
            desc: form.desc.trim(),
            price,
            old,
            stock,
            badge:
              form.badge.trim() ||
              undefined,
            cat: form.cat,
            img: finalImg,
            thumb: finalImg,
            specs: cleanSpecs,
          });

        if (newProductId === null) {
          showToast(
            "Failed to add product"
          );
          return;
        }

        showToast(
          "✓ Product added successfully"
        );
      } else {
        await updateProduct(
          product.id,
          {
            name: form.name.trim(),
            desc: form.desc.trim(),
            price,
            old,
            stock,
            badge:
              form.badge.trim() ||
              undefined,
            cat: form.cat,
            img: finalImg,
            thumb: finalImg,
            specs: cleanSpecs,
          }
        );

        showToast(
          "✓ Product updated successfully"
        );
      }

      onClose();
    } catch (error) {
      console.error(
        "Product save failed:",
        error
      );

      showToast(
        "Failed to save product. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] overflow-y-auto bg-black/80 backdrop-blur-sm"
      data-lenis-prevent
    >
      <div className="flex min-h-full items-center justify-center px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          isNew
            ? "Add new product"
            : `Edit ${product.name}`
        }
        className="relative w-full max-w-[560px] rounded-2xl border border-[#222] bg-[#111] p-6"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted transition-colors hover:text-white disabled:opacity-40"
        >
          <X size={18} />
        </button>

        <h2 className="mb-5 font-display text-2xl tracking-[0.03em]">
          {isNew
            ? "Add New Product"
            : "Edit Product"}
        </h2>

        {/* Photo */}
        <div className="mb-5">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
            Product Photo
          </span>

          <div className="flex items-center gap-3">
            <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1a1a1a]">
              <ProductImage
                src={form.img.trim() || "/images/koala.jpg"}
                alt="Product"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="cursor-pointer rounded-md border border-[#333] px-3 py-1.5 text-center text-xs transition-colors hover:border-accent">
                Upload Photo

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleImageUpload
                  }
                />
              </label>

              <span className="text-[10px] text-[#555]">
                or paste an image URL below
              </span>
            </div>
          </div>

          <input
            type="text"
            value={form.img}
            onChange={(event) =>
              setForm((previousForm) => ({
                ...previousForm,
                img: event.target.value,
              }))
            }
            placeholder="/images/koala.jpg"
            className="mt-2 w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-xs text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
          />
        </div>

        {/* Basic fields */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Product Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  name: event.target.value,
                }))
              }
              placeholder="Product name"
              className="w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Price (₹)
            </label>

            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  price: event.target.value,
                }))
              }
              placeholder="0"
              className="w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Original Price (optional)
            </label>

            <input
              type="number"
              min="0"
              value={form.old}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  old: event.target.value,
                }))
              }
              placeholder="Strikethrough price"
              className="w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Stock Count
            </label>

            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  stock: event.target.value,
                }))
              }
              placeholder="Stock quantity"
              className="w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Category
            </label>

            <select
              value={form.cat}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  cat: event.target
                    .value as Product["cat"],
                }))
              }
              className="w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white focus:border-accent focus:outline-none"
            >
              <option value="wireless">
                Wireless
              </option>

              <option value="defense">
                Defense
              </option>

              <option value="drones">
                Drones
              </option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Badge (optional)
            </label>

            <input
              type="text"
              value={form.badge}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  badge: event.target.value,
                }))
              }
              placeholder="BESTSELLER, TRENDING, etc."
              className="w-full rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Description
            </label>

            <textarea
              value={form.desc}
              onChange={(event) =>
                setForm((previousForm) => ({
                  ...previousForm,
                  desc: event.target.value,
                }))
              }
              rows={4}
              placeholder="Product description"
              className="w-full resize-y rounded-md border border-[#333] bg-[#0d0d0d] px-2.5 py-2 text-sm text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.04em] text-[#888]">
              Specifications
            </span>

            <button
              type="button"
              onClick={addSpec}
              className="text-[11px] font-semibold text-accent hover:underline"
            >
              + Add Spec
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {specs.map((spec, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={spec.l}
                  onChange={(event) =>
                    updateSpec(
                      index,
                      "l",
                      event.target.value
                    )
                  }
                  placeholder="Label"
                  className="w-1/3 rounded-md border border-[#333] bg-[#0d0d0d] px-2 py-1.5 text-xs text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
                />

                <input
                  type="text"
                  value={spec.v}
                  onChange={(event) =>
                    updateSpec(
                      index,
                      "v",
                      event.target.value
                    )
                  }
                  placeholder="Value"
                  className="flex-1 rounded-md border border-[#333] bg-[#0d0d0d] px-2 py-1.5 text-xs text-white placeholder:text-[#555] focus:border-accent focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeSpec(index)
                  }
                  aria-label="Remove specification"
                  className="text-[#555] transition-colors hover:text-[#ff5555]"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-[10px] border border-[#333] py-3 text-sm font-semibold text-muted transition-colors hover:border-[#444] hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] rounded-[10px] bg-accent py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : isNew
                ? "Add Product"
                : "Save Changes"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}