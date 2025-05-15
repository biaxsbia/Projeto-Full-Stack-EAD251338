from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"], methods=["GET", "POST", "PUT", "DELETE"], supports_credentials=True)

client = MongoClient("mongodb://mongo:27017/")
db = client.ongdb

categories_collection = db.categories
promotions_collection = db.promotions


def build_query(args):
    query = {}
    if "category" in args and args["category"]:
        query["categories"] = args["category"]
    
    discount_filter = {}
    if "min_discount" in args and args["min_discount"]:
        try:
            discount_filter["$gte"] = int(args["min_discount"])
        except ValueError:
            pass 
    if "max_discount" in args and args["max_discount"]:
        try:
            discount_filter["$lte"] = int(args["max_discount"])
        except ValueError:
            pass 
    if discount_filter:
        query["desconto"] = discount_filter

    if "valid_until" in args and args["valid_until"]:
        query["validade"] = {"$lte": args["valid_until"]}
        
    if "search_term" in args and args["search_term"]:
        query["nome"] = {"$regex": args["search_term"], "$options": "i"}

    return query


@app.route("/categories", methods=["POST"])
def add_category():
    data = request.get_json()
    if not data or "name" not in data or not data["name"].strip():
        return jsonify({"error": "O nome da categoria é obrigatório e não pode estar vazio"}), 400
    category_name = data["name"].strip()
    if categories_collection.find_one({"name": category_name}):
        return jsonify({"error": "A categoria já existe"}), 409

    result = categories_collection.insert_one({"name": category_name})
    new_category = categories_collection.find_one({"_id": result.inserted_id})
    if new_category:
        new_category["_id"] = str(new_category["_id"])
        return jsonify({"message": "Categoria adicionada com sucesso", "category": new_category}), 201
    else:
        return jsonify({"error": "Falha ao adicionar a categoria"}), 500

@app.route("/categories", methods=["GET"])
def get_categories():
    all_categories = list(categories_collection.find({}))
    for cat in all_categories:
        cat["_id"] = str(cat["_id"])
    return jsonify(all_categories), 200

@app.route("/categories/<category_id>", methods=["PUT"])
def update_category(category_id):
    data = request.get_json()
    if not data or "name" not in data or not data["name"].strip():
        return jsonify({"error": "O novo nome da categoria é obrigatório e não pode estar vazio"}), 400

    new_name = data["name"].strip()

    try:
        obj_id = ObjectId(category_id)
    except Exception:
        return jsonify({"error": "Formato de ID da categoria inválido"}), 400

    current_category = categories_collection.find_one({"_id": obj_id})
    if not current_category:
        return jsonify({"error": "Categoria não encontrada"}), 404

    old_name = current_category["name"]

    if new_name != old_name and categories_collection.find_one({"name": new_name, "_id": {"$ne": obj_id}}):
        return jsonify({"error": "Já existe outra categoria com esse nome"}), 409

    categories_collection.update_one({"_id": obj_id}, {"$set": {"name": new_name}})

    if old_name != new_name:
        promotions_collection.update_many(
            {"categories": old_name},
            {"$set": {"categories.$": new_name}}
        )
        promotions_to_update = list(promotions_collection.find({"categories": old_name}))
        for promo in promotions_to_update:
            new_categories_for_promo = [new_name if c == old_name else c for c in promo["categories"]]
            promotions_collection.update_one({"_id": promo["_id"]}, {"$set": {"categories": new_categories_for_promo}})

    updated_category = categories_collection.find_one({"_id": obj_id})
    if updated_category:
        updated_category["_id"] = str(updated_category["_id"])
        return jsonify({"message": "Categoria atualizada com sucesso", "category": updated_category}), 200
    else:
        return jsonify({"error": "Falha ao recuperar a categoria atualizada"}), 500

@app.route("/categories/<category_id>", methods=["DELETE"])
def delete_category(category_id):
    try:
        obj_id = ObjectId(category_id)
    except Exception:
        return jsonify({"error": "Formato de ID da categoria inválido"}), 400

    category_to_delete = categories_collection.find_one({"_id": obj_id})
    if not category_to_delete:
        return jsonify({"error": "Categoria não encontrada"}), 404

    category_name_to_delete = category_to_delete["name"]

    promotions_collection.update_many(
        {"categories": category_name_to_delete},
        {"$pull": {"categories": category_name_to_delete}}
    )

    result = categories_collection.delete_one({"_id": obj_id})
    if result.deleted_count > 0:
        return jsonify({"message": "Categoria deletada com sucesso"}), 200
    else:
        return jsonify({"error": "Categoria não encontrada"}), 404

@app.route("/promotions", methods=["GET"])
def get_promotions():
    query_params = request.args
    mongo_query = build_query(query_params)
    promotions = list(promotions_collection.find(mongo_query))
    for promotion in promotions:
        promotion["_id"] = str(promotion["_id"])
    return jsonify(promotions), 200

@app.route("/promotions", methods=["POST"])
def add_promotion():
    new_promotion = request.get_json()
    if "categories" not in new_promotion:
        new_promotion["categories"] = []
    elif not isinstance(new_promotion["categories"], list):
        return jsonify({"error": "O campo 'categories' deve ser uma lista de strings"}), 400
    result = promotions_collection.insert_one(new_promotion)
    inserted_id = str(result.inserted_id)
    return jsonify({"message": "Promoção cadastrada com sucesso", "id": inserted_id}), 201

@app.route("/promotions/<promotion_id>", methods=["GET"])
def get_promotion_details(promotion_id):
    try:
        promotion = promotions_collection.find_one({"_id": ObjectId(promotion_id)})
    except Exception:
        return jsonify({"error": "Formato de ID da promoção inválido"}), 400
    if promotion:
        promotion["_id"] = str(promotion["_id"])
        return jsonify(promotion), 200
    return jsonify({"error": "Promoção não encontrada"}), 404

@app.route("/promotions/<promotion_id>", methods=["DELETE"])
def delete_promotion(promotion_id):
    try:
        result = promotions_collection.delete_one({"_id": ObjectId(promotion_id)})
    except Exception:
        return jsonify({"error": "Formato de ID da promoção inválido"}), 400
    if result.deleted_count > 0:
        return jsonify({"message": "Promoção deletada com sucesso"}), 200
    return jsonify({"error": "Promoção não encontrada"}), 404

@app.route("/promotions/<promotion_id>", methods=["PUT"])
def update_promotion(promotion_id):
    updated_data = request.get_json()
    if "categories" in updated_data and not isinstance(updated_data["categories"], list):
        return jsonify({"error": "O campo 'categories' deve ser uma lista de strings"}), 400
    try:
        result = promotions_collection.update_one({"_id": ObjectId(promotion_id)}, {"$set": updated_data})
    except Exception:
        return jsonify({"error": "Formato de ID da promoção inválido"}), 400
    if result.modified_count > 0:
        updated_promotion = promotions_collection.find_one({"_id": ObjectId(promotion_id)})
        if updated_promotion:
            updated_promotion["_id"] = str(updated_promotion["_id"])
            return jsonify({"message": "Promoção atualizada com sucesso", "promotion": updated_promotion}), 200
        else:
            return jsonify({"message": "Promoção atualizada com sucesso, mas não foi possível recuperar os dados atualizados"}), 200
    elif result.matched_count > 0:
        return jsonify({"message": "Nenhum dado foi alterado na promoção"}), 200
    else:
        return jsonify({"error": "Promoção não encontrada"}), 404


@app.route("/statistics", methods=["GET"])
def get_statistics():
    total_promotions = promotions_collection.count_documents({})
    pipeline = [
        {"$unwind": {"path": "$categories", "preserveNullAndEmptyArrays": True}},
        {"$group": {"_id": "$categories", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    promotions_by_category = list(promotions_collection.aggregate(pipeline))
    promotions_by_category = [entry for entry in promotions_by_category if entry["_id"] is not None and entry["_id"] != ""]

    active_promotions = 0
    expired_promotions = 0
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    all_promos_for_status = promotions_collection.find({}, {"validade": 1})
    for promo in all_promos_for_status:
        if "validade" in promo and promo["validade"]:
            try:
                if promo["validade"] >= today_str:
                    active_promotions += 1
                else:
                    expired_promotions += 1
            except TypeError:
                pass
    total_discount_offered = 0
    pipeline_discount = [
        {
            "$project": {
                "discount_amount": {
                    "$cond": {
                        "if": {"$and": [
                            {"$ne": ["$valor", None]},
                            {"$ne": ["$desconto", None]},
                            {"$isNumber": "$valor"},
                            {"$isNumber": "$desconto"}
                        ]},
                        "then": {"$multiply": ["$valor", {"$divide": ["$desconto", 100]}]},
                        "else": 0
                    }
                }
            }
        },
        {
            "$group": {
                "_id": None,
                "total_discount": {"$sum": "$discount_amount"}
            }
        }
    ]
    discount_result = list(promotions_collection.aggregate(pipeline_discount))
    if discount_result and "total_discount" in discount_result[0]:
        total_discount_offered = round(discount_result[0]["total_discount"], 2)
    stats = {
        "total_promotions": total_promotions,
        "promotions_by_category": promotions_by_category,
        "active_promotions": active_promotions,
        "expired_promotions": expired_promotions,
        "total_discount_offered": total_discount_offered
    }
    return jsonify(stats), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

