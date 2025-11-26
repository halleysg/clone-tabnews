function status(req, res) {
  res.status(200).json({ message: "API is running" });
}

export default status;
