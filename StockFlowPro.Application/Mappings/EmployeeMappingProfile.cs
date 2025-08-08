using AutoMapper;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

public class EmployeeMappingProfile : Profile
{
    public EmployeeMappingProfile()
    {
        CreateMap<Employee, EmployeeDto>()
            .ForMember(d => d.Documents, opt => opt.MapFrom(s => s.Documents))
            .ForMember(d => d.ImageUrl, opt => opt.MapFrom(s => s.ImageUrl));

        CreateMap<EmployeeDocument, EmployeeDocumentDto>();

        CreateMap<CreateEmployeeDto, Employee>();

        // Update mapping handled manually in handler (partial updates)
    }
}
