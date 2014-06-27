from pyramid.config import Configurator


def main(global_config, **settings):
    config = Configurator(settings=settings)
    config.include('pyramid_jinja2')
    #config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_static_view('static', 'static', cache_max_age=0)
    config.add_route('home', '/')
    config.add_route('callback', 'callback')
    config.add_route('auth', 'api/auth')
    config.add_route('validate_auth', 'api/validate_auth')
    config.add_route('verify_credentials', 'api/verify_credentials')
    config.add_route('get_saved_searches', 'api/get_saved_searches')
    config.add_route('create_saved_search', 'api/create_saved_search')
    config.add_route('destroy_saved_search', 'api/destroy_saved_search')
    config.add_route('get_home_timeline', 'api/get_home_timeline')
    config.add_route('search', 'api/search')
    config.scan()
    return config.make_wsgi_app()
