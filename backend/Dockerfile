FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY LifeOS.slnx ./
COPY LifeOS.Domain/LifeOS.Domain.csproj LifeOS.Domain/
COPY LifeOS.Application/LifeOS.Application.csproj LifeOS.Application/
COPY LifeOS.Infrastructure/LifeOS.Infrastructure.csproj LifeOS.Infrastructure/
COPY LifeOS.Api/LifeOS.Api.csproj LifeOS.Api/
RUN dotnet restore LifeOS.Api/LifeOS.Api.csproj
COPY . .
RUN dotnet publish LifeOS.Api/LifeOS.Api.csproj -c Release --no-restore -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "LifeOS.Api.dll"]
