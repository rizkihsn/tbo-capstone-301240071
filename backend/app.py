from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    register_blueprints(app)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'message': 'AutomataLab Backend is running properly.',
            'data': None,
            'errors': None
        }), 200

    return app

def register_blueprints(app):
    from routes.dfa import bp as dfa_bp
    app.register_blueprint(dfa_bp, url_prefix='/api/v1/dfa')

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'success': False, 'message': 'Bad Request', 'data': None, 'errors': str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Resource not found', 'data': None, 'errors': str(error)}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'message': 'Internal Server Error', 'data': None, 'errors': str(error)}), 500

if __name__ == '__main__':
    app = create_app()
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
