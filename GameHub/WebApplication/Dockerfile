FROM node:16-alpine AS frontend-build
WORKDIR /frontend
COPY --from=frontend . .
RUN npm install --legacy-peer-deps
RUN npm run build:prod

FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS build-env
# Copy built frontend
WORKDIR /WebApplication/wwwroot
COPY --from=frontend-build /frontend/dist .
# Copy everything else
WORKDIR /WebApplication
COPY . .
# Restore as distinct layers
RUN dotnet restore
RUN dotnet publish -c Release -o out --no-self-contained

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine
WORKDIR /WebApplication
COPY --from=build-env /WebApplication/out .
ENTRYPOINT ["dotnet", "WebApplication.dll"]