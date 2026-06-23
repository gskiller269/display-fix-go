const express = require('express');
const router = express.Router();
const { 
  getAllProductTypes, 
  createProductType, 
  updateProductType, 
  deleteProductType 
} = require('../controllers/product_type.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product type
 *         name:
 *           type: string
 *           description: The name of the product type (e.g., Smartphone, Laptop)
 *         image_id:
 *           type: integer
 *           description: The id of the associated image from the images table
 *         image_url:
 *           type: string
 *           description: The URL of the associated image
 *       example:
 *         id: 1
 *         name: "Smartphone"
 *         image_id: 5
 *         image_url: "/uploads/types/smartphone.png"
 */

/**
 * @swagger
 * tags:
 *   name: ProductTypes
 *   description: The product types managing API
 */

/**
 * @swagger
 * /product-types:
 *   get:
 *     summary: Returns the list of all product types
 *     tags: [ProductTypes]
 *     responses:
 *       200:
 *         description: The list of product types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductType'
 */
router.get('/', getAllProductTypes);

/**
 * @swagger
 * /product-types:
 *   post:
 *     summary: Create a new product type
 *     tags: [ProductTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductType'
 *     responses:
 *       201:
 *         description: The product type was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductType'
 */
router.post('/', createProductType);

/**
 * @swagger
 * /product-types/{id}:
 *   put:
 *     summary: Update a product type by id
 *     tags: [ProductTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product type id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductType'
 *     responses:
 *       200:
 *         description: The product type was updated
 *       404:
 *         description: The product type was not found
 */
router.put('/:id', updateProductType);

/**
 * @swagger
 * /product-types/{id}:
 *   delete:
 *     summary: Remove a product type by id
 *     tags: [ProductTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product type id
 *     responses:
 *       200:
 *         description: The product type was deleted
 *       404:
 *         description: The product type was not found
 */
router.delete('/:id', deleteProductType);

module.exports = router;
