using AutoMapper;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.GetFullName()))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.GetAge()))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
            .ForMember(dest => dest.ProfilePhotoUrl, opt => opt.MapFrom(src => src.ProfilePhotoUrl));

        CreateMap<CreateUserCommand, User>()
            .ConstructUsing(src => new User(src.FirstName, src.LastName, src.Email, src.PhoneNumber, src.DateOfBirth, src.Role, src.PasswordHash));
        CreateMap<CreateUserDto, CreateUserCommand>();
        CreateMap<CreateUserDto, User>()
            .ConstructUsing(src => new User(src.FirstName, src.LastName, src.Email, src.PhoneNumber, src.DateOfBirth, src.Role, src.PasswordHash));

        CreateMap<UpdateUserDto, UpdateUserCommand>();
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom((src, dest) => src.Role.HasValue ? src.Role.Value : dest.Role));
        CreateMap<UpdateUserEmailDto, UpdateUserEmailCommand>();

        // Profile mappings
        CreateMap<User, ProfileDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.GetFullName()))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.GetAge()))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
            .ForMember(dest => dest.ProfilePhotoUrl, opt => opt.MapFrom(src => src.ProfilePhotoUrl));

        CreateMap<EditProfileDto, EditProfileCommand>();
    }
}
