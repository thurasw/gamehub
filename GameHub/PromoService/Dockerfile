FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS build-env
WORKDIR /PromoService

# Copy everything
COPY . ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out --no-self-contained

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine
WORKDIR /PromoService
COPY --from=build-env /PromoService/out .
ENTRYPOINT ["dotnet", "PromoService.dll"]