/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         stack:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         mobile_number:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, shop_owner, technician, customer]
 *         profile_image_url:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         image_url:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     ProductType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *           description: The category of the product (e.g., Smartphone, Earbuds)
 *     Product:
 *       type: object
 *       required:
 *         - type_id
 *         - brand
 *         - model
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *         type_id:
 *           type: integer
 *           description: ID from product_types table
 *         type:
 *           type: string
 *           description: The category name (fetched via JOIN)
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         description:
 *           type: string
 *         image_ids:
 *           type: string
 *           description: Comma-separated image IDs
 *         image_url:
 *           type: string
 *           description: Primary image URL (first from images)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: List of all image URLs for this product
 *         price:
 *           type: number
 *         clicks:
 *           type: integer
 *           default: 0
 *         active:
 *           type: boolean
 *           default: true
 *         active_by:
 *           type: string
 *           enum: [admin, shopowner]
 *           default: admin
 *     Address:
 *       type: object
 *       required:
 *         - full_name
 *         - mobile_number
 *         - address_line1
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         label:
 *           type: string
 *         full_name:
 *           type: string
 *         mobile_number:
 *           type: string
 *         address_line1:
 *           type: string
 *         address_line2:
 *           type: string
 *         landmark:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         pincode:
 *           type: string
 *         is_active:
 *           type: boolean
 *     RepairBooking:
 *       type: object
 *       required:
 *         - device_brand
 *         - device_model
 *         - problem_type
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         device_brand:
 *           type: string
 *         device_model:
 *           type: string
 *         problem_type:
 *           type: string
 *         problem_description:
 *           type: string
 *         address_id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: ['pending', 'technician_assigned', 'on_the_way', 'reached', 'repaired']
 *         technician_name:
 *           type: string
 *         eta:
 *           type: string
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         address_id:
 *           type: integer
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
 *         payment_status:
 *           type: string
 *           enum: ['pending', 'paid', 'failed', 'refunded']
 *         payment_method:
 *           type: string
 *     Shop:
 *       type: object
 *       required:
 *         - shop_name
 *         - phone_number
 *         - address
 *       properties:
 *         id:
 *           type: integer
 *         owner_id:
 *           type: integer
 *         shop_name:
 *           type: string
 *         phone_number:
 *           type: string
 *         address:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         image_url:
 *           type: string
 *         rating:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, active, inactive]
 *     Review:
 *       type: object
 *       required:
 *         - product_id
 *         - rating
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         product_id:
 *           type: integer
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */
module.exports = {};
