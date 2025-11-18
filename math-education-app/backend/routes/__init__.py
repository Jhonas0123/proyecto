from flask import Blueprint

routes = Blueprint('routes', __name__)

from . import math_routes
from . import user_routes