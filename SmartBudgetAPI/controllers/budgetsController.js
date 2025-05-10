const {
  getAllBudgets,
  addBudget,
  updateBudgetBalance,
} = require("../models/budgetsModel");
const { sql, connectToDatabase } = require("../models/db");

// GET all budgets
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await getAllBudgets();
    res.json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res
      .status(500)
      .json({ message: "Error fetching budgets", error: err.message });
  }
};

// GET a single budget by id
exports.getBudgetById = async (req, res) => {
  const budgetId = req.params.id;
  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("id", sql.Int, budgetId)
      .query("SELECT * FROM Budgets WHERE BudgetID = @id");
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching budget:", err);
    res
      .status(500)
      .json({ message: "Error fetching budget", error: err.message });
  }
};

// POST: Create a new budget
exports.createBudget = async (req, res) => {
  const { walletId, totalAmount, month, year } = req.body;

  // Use the user from the authenticated request (added by authMiddleware)
  const userId = req.user.UserID;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "You must be logged in to create a budget." });
  }

  try {
    const pool = await connectToDatabase();

    // Ensure the wallet belongs to the current user
    const walletCheck = await pool
      .request()
      .input("walletId", sql.Int, walletId)
      .input("userId", sql.Int, userId)
      .query(
        "SELECT * FROM UserWallets WHERE WalletID = @walletId AND UserID = @userId"
      );

    if (walletCheck.recordset.length === 0) {
      return res
        .status(403)
        .json({
          message: "This wallet does not belong to the authenticated user.",
        });
    }

    // Create the budget
    const budgetId = await addBudget(
      userId,
      walletId,
      totalAmount,
      month,
      year
    );
    res.status(201).json({ message: "Budget created successfully", budgetId });

    res.status(201).json({
      message: "Budget created successfully",
      walletId,
      totalAmount,
      month,
      year,
      budgetId, // Added the budgetId here
    });
  } catch (err) {
    console.error("Error creating budget:", err);
    res
      .status(500)
      .json({ message: "Error creating budget", error: err.message });
  }
};

// DELETE a budget by id
exports.deleteBudget = async (req, res) => {
  const budgetId = req.params.id;
  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("budgetId", sql.Int, budgetId)
      .query("DELETE FROM Budgets WHERE BudgetID = @budgetId");
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res
      .status(500)
      .json({ message: "Error deleting budget", error: err.message });
  }
};

// PUT: Update a budget by id
exports.updateBudget = async (req, res) => {
  const budgetId = req.params.id;
  const { totalAmount, month, year } = req.body;

  try {
    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input("budgetId", sql.Int, budgetId)
      .input("totalAmount", sql.Decimal(10, 2), totalAmount)
      .input("month", sql.Int, month)
      .input("year", sql.Int, year).query(`
        UPDATE Budgets
        SET TotalAmount = @totalAmount, Month = @month, Year = @year, UpdatedAt = GETDATE()
        WHERE BudgetID = @budgetId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget updated successfully" });
  } catch (err) {
    console.error("Error updating budget:", err);
    res
      .status(500)
      .json({ message: "Error updating budget", error: err.message });
  }
};
