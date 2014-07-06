# config valid only for Capistrano 3.1
lock '3.2.1'

set :application, 'heavycode'
set :repo_url, 'git@github.com:rvboris/heavycode.git'

# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }

# Default deploy_to directory is /var/www/my_app
set :deploy_to, '/var/www/heavycode.ru/stages/production'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
set :log_level, :info

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_files, %w{config/database.yml}

# Default value for linked_dirs is []
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

set :user, 'deploy'

set :ssh_options, {
   #verbose: :debug,
   #:keys => %w(E:\keys\home-deploy),
   user: fetch(:user)
}

role :app, "deploy@heavycode.ru"

namespace :deploy do

  desc 'Start application'
  task :start do
    on roles(:app), in: :sequence, wait: 5 do
      within current_path do
        execute :pm2, "start", "server.js", "--name", "heavycode", "--", "--port", "7878", "--env", "production"
      end
    end
  end

  desc 'Stop application'
  task :stop do
    on roles(:app), in: :sequence, wait: 5 do
      within current_path do
        begin
          execute :pm2, "delete", "heavycode"
        rescue
          print "App instance not running, continue"
        end
      end
    end
  end

  desc 'Restart application'
  task :restart do

  end

  before :restart, :stop
  after :restart, :start

  desc 'NPM Install'
  task :npm_install do
    on roles(:app), in: :sequence, wait: 5 do
      within current_path do
      	execute :npm, "cache", "clean"
        execute :npm, "install"
      end
      within current_path + "frontend" do
        execute :npm, "install"
      end
    end
  end

  desc 'Bower Install'
  task :bower_install do
    on roles(:app), in: :sequence, wait: 5 do
      within current_path + "frontend" do
      	execute :bower, "cache", "clean"
        execute :bower, "install"
      end
    end
  end

  desc 'Lineman Build'
  task :lineman_build do
    on roles(:app), in: :sequence, wait: 5 do
      within current_path + "frontend" do
      	execute :lineman, "build"
      end
    end
  end

  after :published, :npm_install
  after :published, :bower_install
  after :bower_install, :lineman_build
  after :lineman_build, :restart, :start

end
