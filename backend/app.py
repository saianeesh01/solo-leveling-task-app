from flask import Flask, request, jsonify
from quests import generate_daily_quests
from utils import update_xp, apply_penalty
import logging
from agentic_routes import agentic
from core_tasks import core  # ← Add this


app = Flask(__name__)
app.register_blueprint(agentic)
app.register_blueprint(core)  # ← And this
# Logging setup
logging.basicConfig(filename='app.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')

@app.route('/api/quests', methods=['GET'])
def get_quests():
    try:
        result = generate_daily_quests()
        logging.info('Successfully generated daily quests')
        return jsonify(result)
    except Exception as e:
        logging.error('Failed to generate daily quests: ' + str(e))
        return jsonify({'error': 'Failed to generate daily quests'}), 500

@app.route('/api/complete', methods=['POST'])
def complete_task():
    try:
        data = request.json
        result = update_xp(data["task"], data["completed"])
        logging.info('Task completed: ' + data["task"])
        return jsonify(result)
    except Exception as e:
        logging.error('Failed to complete task: ' + str(e))
        return jsonify({'error': 'Failed to complete task'}), 500

@app.route('/api/penalty', methods=['POST'])
def penalty():
    try:
        result = apply_penalty()
        logging.info('Penalty applied')
        return jsonify(result)
    except Exception as e:
        logging.error('Failed to apply penalty: ' + str(e))
        return jsonify({'error': 'Failed to apply penalty'}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

