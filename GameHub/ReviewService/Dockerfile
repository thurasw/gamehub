FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build-env
WORKDIR /ReviewService

# Copy everything
COPY . ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out --no-self-contained

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /ReviewService
COPY --from=build-env /ReviewService/out .
ENTRYPOINT ["dotnet", "ReviewService.dll"]