// Helper buat response standar
export const success = (res, data, message = "Berhasil") => {
  return res.json({
    status: true,
    code: 200,
    message,
    result: data,
  });
};

export const error = (res, message = "Gagal", code = 500) => {
  return res.status(code).json({
    status: false,
    code,
    message,
  });
};

// Validasi URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
