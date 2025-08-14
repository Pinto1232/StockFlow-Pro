using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Landing;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Landing;

public class GetLandingStatsHandler : IRequestHandler<GetLandingStatsQuery, IEnumerable<LandingStatDto>>
{
    private readonly ILandingStatRepository _statRepository;
    private readonly IMapper _mapper;

    public GetLandingStatsHandler(ILandingStatRepository statRepository, IMapper mapper)
    {
        _statRepository = statRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LandingStatDto>> Handle(GetLandingStatsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var stats = request.ActiveOnly
            ? await _statRepository.GetActiveStatsByOrderAsync(cancellationToken)
            : await _statRepository.GetAllByOrderAsync(cancellationToken);

        return _mapper.Map<IEnumerable<LandingStatDto>>(stats);
    }
}
