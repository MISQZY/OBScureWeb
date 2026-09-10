set -euo pipefail

DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')
[ -z "$DEFAULT_BRANCH" ] && DEFAULT_BRANCH="main"

echo "⬇️  Pulling latest code..."
git checkout -- .
git pull origin "$DEFAULT_BRANCH"

# templates-data is a named Docker volume (see docker-compose.yml), not a
# host bind mount — the Dockerfile pre-creates and chowns /data/templates
# to the non-root nextjs user (uid/gid 1001) so Docker seeds the volume
# with correct ownership on first creation. Nothing to fix up here.

# Captured *before* pulling/restarting — this is the image ID rollback below
# actually restores. (Capturing it after the restart, like this script used
# to, would just capture the new image that's about to fail — too late to
# be useful as a rollback target.)
PREVIOUS_IMAGE=$(docker inspect --format='{{.Image}}' obscure_web 2>/dev/null || true)

echo "⬇️  Pulling latest image..."
docker compose pull web

echo "🔄 Restarting with zero downtime..."
docker compose up -d --no-deps web

echo "⏳ Waiting for app to be healthy..."
for i in $(seq 1 15); do
  if docker compose ps web | grep -q "Up"; then
    echo "✅ App is up!"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "❌ App did not start in time, rolling back..."
    if [ -n "$PREVIOUS_IMAGE" ]; then
      docker compose stop web
      docker rm -f $(docker compose ps -q web) 2>/dev/null || true
      sed -i "s|image:.*|image: $PREVIOUS_IMAGE|" docker-compose.yml
      docker compose up -d --no-deps web
    else
      echo "⚠️ No previous image to rollback, exiting..."
      exit 1
    fi
    exit 1
  fi
  sleep 2
done

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Done!"
