import Client from "../models/clientModel.js";

const getLogoUrl = (file) => {
  return file?.path || file?.secure_url || file?.url || "";
};

// Create client logo.
export const createClient = async (req, res) => {
  try {
    const { clientName, order, status } = req.body;

    if (!clientName) {
      return res.status(400).json({
        message: "Client name is required",
      });
    }

    const logoUrl = getLogoUrl(req.file);

    if (!logoUrl) {
      return res.status(400).json({
        message: "Client logo is required",
      });
    }

    const client = await Client.create({
      clientName: clientName.trim(),
      logo: logoUrl,
      order: Number(order) || 1,
      status: status === "Draft" ? "Draft" : "Active",
    });

    return res.status(201).json({
      message: "Client added successfully",
      client,
    });
  } catch (error) {
    console.error("Create Client Error:", error);

    return res.status(500).json({
      message: "Failed to add client",
      error: error.message,
    });
  }
};

// Get all clients.
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json(clients);
  } catch (error) {
    console.error("Get Clients Error:", error);

    return res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// Update client.
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const { clientName, order, status } = req.body;

    if (!clientName) {
      return res.status(400).json({
        message: "Client name is required",
      });
    }

    const logoUrl = getLogoUrl(req.file);

    client.clientName = clientName.trim();
    client.order = Number(order) || 1;
    client.status = status === "Draft" ? "Draft" : "Active";

    if (logoUrl) {
      client.logo = logoUrl;
    }

    const updatedClient = await client.save();

    return res.status(200).json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Update Client Error:", error);

    return res.status(500).json({
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// Delete client.
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    return res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete Client Error:", error);

    return res.status(500).json({
      message: "Failed to delete client",
      error: error.message,
    });
  }
};