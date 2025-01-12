using DynamicGrids, OffsetArrays, Test, Dates
using DynamicGrids: _initdata!, data, init, mask, boundary, source, dest, 
    sourcestatus, deststatus, gridsize, ruleset, grids, SimData, Extent,
    _updatetime, WritableGridData, tspan, extent

inita = [0 1 1
         0 1 1]
initb = [2 2 2
         2 2 2]
initab = (a=inita, b=initb)

life = Life{:a,:a}()
tspan_ = DateTime(2001):Day(1):DateTime(2001, 2)

@testset "_initdata!" begin
    rs = Ruleset(life, timestep=Day(1); opt=SparseOpt());

    ext = Extent(; init=initab, tspan=tspan_)
    simdata = SimData(ext, rs)

    @test simdata isa SimData
    @test init(simdata) == initab
    @test mask(simdata) === nothing
    @test ruleset(simdata) === StaticRuleset(rs)
    @test tspan(simdata) === tspan_
    @test currentframe(simdata) === 1
    @test first(simdata) === simdata[:a]
    @test last(simdata) === simdata[:b]
    @test boundary(simdata) === Remove()
    @test gridsize(simdata) == (2, 3)
    updated = _updatetime(simdata, 2)
    @test currenttimestep(simdata) == Millisecond(86400000)

    gs = grids(simdata)
    grida = gs[:a]
    gridb = gs[:b]

    @test parent(source(grida)) == parent(dest(grida)) ==
        [0 0 0 0 0
         0 0 1 1 0
         0 0 1 1 0
         0 0 0 0 0
         0 0 0 0 0
         0 0 0 0 0]

    wgrida = WritableGridData(grida)
    @test parent(source(grida)) === parent(source(wgrida))
    @test parent(dest(grida)) === parent(dest(wgrida))

    @test parent(grida) == parent(wgrida) ==
        [0 1 1 
         0 1 1]
    

    @test sourcestatus(grida) == deststatus(grida) == 
        [0 1 0 0
         0 1 0 0
         0 0 0 0
         0 0 0 0]

    @test parent(source(gridb)) == parent(dest(gridb)) == 
        [2 2 2
         2 2 2]
    @test sourcestatus(gridb) == deststatus(gridb) == nothing

    @test firstindex(grida) == 1
    @test lastindex(grida) == 6
    @test gridsize(grida) == (2, 3) == size(grida) == (2, 3)
    @test axes(grida) == (1:2, 1:3)
    @test ndims(grida) == 2
    @test eltype(grida) == Int

    output = ArrayOutput(initab; tspan=tspan_)
    _initdata!(simdata, output, extent(output), rs)
end

@testset "initdata! with :_default_" begin
    initx = [1 0]
    rs = Ruleset(Life())
    output = ArrayOutput((_default_=initx,); tspan=tspan_)
    simdata = SimData(output, rs)
    simdata2 = _initdata!(simdata, output, extent(output), rs)
    @test keys(simdata2) == (:_default_,)
    @test DynamicGrids.ruleset(simdata2) == DynamicGrids.StaticRuleset(rs)
    @test DynamicGrids.init(simdata2)[:_default_] == [1 0]
    @test DynamicGrids.source(simdata2[:_default_]) == 
        OffsetArray([0 0 0 0
                     0 1 0 0
                     0 0 0 0
                     0 0 0 0
                     0 0 0 0], (0:4, 0:3))
end
