var documenterSearchIndex = {"docs":
[{"location":"#DynamicGrids.jl-1","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"DynamicGrids","category":"page"},{"location":"#DynamicGrids","page":"DynamicGrids.jl","title":"DynamicGrids","text":"DynamicGrids\n\n(Image: ) (Image: ) (Image: Build Status)  (Image: Buildcellularautomatabase status) (Image: Coverage Status)  (Image: codecov.io)\n\nDynamicGrids is a generalised modular framework for cellular automata and similar grid-based spatial models.\n\nThe framework is highly customisable, but there are some central ideas that define how a simulation works: rules, init arrays and outputs.\n\nRules\n\nRules hold the parameters for running a simulation. Each rule triggers a specific applyrule method that operates on each of the cells in the grid. Rules come in a number of flavours (outlined in the docs), which allows assumptions to be made about running them that can greatly improve performance. Rules are joined in a Ruleset object and run in sequence.\n\nInit\n\nThe init array may be any AbstractArray, containing whatever initialisation data is required to start the simulation. The array type and element type of the init array determine the types used in the simulation, as well as providing the initial conditions. An init array can be attached to a Ruleset or passed into a simulation (the latter will take preference).\n\nOutputs\n\nOutputs (in AbstractOuput) are ways of storing of viewing a simulation. They can be used interchangeably depending on your needs: ArrayOutput is a simple storage structure for high performance-simulations. The REPLOutput can be useful for checking a simulation when working in a terminal or over ssh.\n\nDynamicGridsInteract.jl provides simulation interfaces for use in Juno, Jupyter, web pages or electron apps, with live interactive control over parameters. DynamicGridsGtk.jl is a simple graphical output for Gtk. These packages are kept separate to avoid dependencies when being used in non-graphical simulations. Outputs are also easy to write, and high performance or applications may benefit from writing a custom output to reduce memory use, while custom frame processors can help developing specialised visualisations.\n\nSimulations\n\nA typical simulation is run with a script like:\n\ninit = my_array\nrules = Ruleset(Life(); init=init)\noutput = ArrayOutput(init)\n\nsim!(output, rules)\n\nMultiple models can be passed to sim! in a Ruleset. Each rule will be run for the whole grid, in sequence, using appropriate optimisations depending on the parent types of the rules.\n\nsim!(output, Ruleset(rule1, rule2); init=init)\n\nFor better performance (often ~2x), models included in a Chain object will be combined into a single model, using only one array read and write. This optimisation is limited to AbstractCellRule, or an AbstractNeighborhoodRule followed by AbstractCellRule. If the @inline compiler macro is used on all applyrule methods, rules in a Chain will be compiled together into a single function call.\n\nsim!(output, Rules(rule1, Chain(rule2, rule3)); init=init)\n\nDynamicGrids.jl is extended by Dispersal.jl for modelling organism dispersal. Dispersal.jl is a useful template for writing other extensions, and includes many Rules, as well as a custom frame procesor for display and output for better simulation performance.\n\nFuture work\n\nMulti-entity simulations\n\nUsing the same architecture we can simulate multiple entities and their interactions in a single simulations. This will involve using arrays of static arrays (and LabelledArrays). Each field of these arrays may have custom rules or similar rules with different parameters, anbd may also have rules that define how they interact. This will enable previously unavailable multi-species, multi-genome, multi age-class dispersal models in ecology, and likely other applications in other fields. \n\nA DSL is being developed to write these complex models with a similar syntax, that will also enable further performance optimisations.\n\n\n\n\n\n","category":"module"},{"location":"#Examples-1","page":"DynamicGrids.jl","title":"Examples","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"While this package isn't designed or optimised specifically to run the game of life, it's a simple example of what this package can do. This example runs a game of life and displays it in a REPLOutput.","category":"page"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"using DynamicGrids\n\n# Build a random starting grid\ninit = round.(Int8, max.(0.0, rand(-2.0:0.1:1.0, 70,70)))\n\n# Use the default game of life model\nmodel = Ruleset(Life())\n\n# Use an output that shows the cellular automata as blocks in the REPL\noutput = REPLOutput{:block}(init; fps=100)\n\nsim!(output, model, init; tstop=5)","category":"page"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"More life-like examples:","category":"page"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"# Morley\nsim!(output, Ruleset(Life(b=[3,6,8], s=[2,4,5]); init=init))\n\n# 2x2\nsim!(output, Ruleset(Life(b=[3,6], s=[1,2,5]); init=init))\n\n# Dimoeba\ninit1 = round.(Int8, max.(0.0, rand(70,70)))\nsim!(output, Ruleset(Life(b=[3,5,6,7,8], s=[5,6,7,8]); init=init1))\n\n## No death\nsim!(output, Ruleset(Life(b=[3], s=[0,1,2,3,4,5,6,7,8]); init))\n\n## 34 life\nsim!(output, Ruleset(Life(b=[3,4], s=[3,4])); init=init, fps=10)\n\n# Replicator\ninit2 = round.(Int8, max.(0.0, rand(70,70)))\ninit2[:, 1:30] .= 0\ninit2[21:50, :] .= 0\nsim!(output, Ruleset(Life(b=[1,3,5,7], s=[1,3,5,7])); init=init2)","category":"page"},{"location":"#Rules-1","page":"DynamicGrids.jl","title":"Rules","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"Rules define simulation behaviour. They hold data relevant to the simulation, and trigger dispatch of particular applyrule or applyrule! methods. Rules can be chained together arbitrarily to make composite simulations.","category":"page"},{"location":"#Types-and-Constructors-1","page":"DynamicGrids.jl","title":"Types and Constructors","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"AbstractRule\nAbstractCellRule\nAbstractNeighborhoodRule\nAbstractPartialRule\nAbstractPartialNeighborhoodRule\nLife","category":"page"},{"location":"#DynamicGrids.AbstractRule","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractRule","text":"abstract type AbstractRule\n\nA rule contains all the information required to run a rule in a cellular simulation, given an initial array. Rules can be chained together sequentially.\n\nThe output of the rule for an AbstractRule is allways written to the current cell in the grid.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.AbstractCellRule","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractCellRule","text":"abstract type AbstractCellRule <: AbstractRule\n\nA Rule that only writes and accesses a single cell: its return value is the new value of the cell. This limitation can be useful for performance optimisations.\n\nAccessing the data.source and data.dest arrays directly is not guaranteed to have correct results, and should not be done.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.AbstractNeighborhoodRule","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractNeighborhoodRule","text":"abstract type AbstractNeighborhoodRule <: AbstractRule\n\nA Rule That only accesses a neighborhood, defined by its radius distance from the current cell.\n\nFor each cell a buffer will be populated containing the neighborhood cells, accessible with buffer(data). This allows memory optimisations and the use of BLAS routines on the neighborhood.  It also means that and no bounds checking is required.\n\nAbstractNeighborhoodRule must read only from the state variable and the  neighborhood_buffer array, and never manually write to the dest(data) array.  Its return value is allways written to the central cell.\n\nCustom Neighborhood rules must return their radius with a radius() method.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.AbstractPartialRule","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractPartialRule","text":"abstract type AbstractPartialRule <: AbstractRule\n\nAbstractPartialRule is for rules that manually write to whichever cells of the grid that they choose, instead of updating every cell with their output.\n\nUpdates to the destination array (dest(data)) must be performed manually, while the source array can be accessed with source(data).\n\nThe dest array is copied from the source prior to running the applyrule! method.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.AbstractPartialNeighborhoodRule","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractPartialNeighborhoodRule","text":"abstract type AbstractPartialNeighborhoodRule <: AbstractPartialRule\n\nA Rule that only writes to its neighborhood, defined by its radius distance from the current point. TODO: should this exist?\n\nCustom PartialNeighborhood rules must return their radius with a radius() method.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.Life","page":"DynamicGrids.jl","title":"DynamicGrids.Life","text":"Rule for game-of-life style cellular automata. \n\nField Description Default Limits\nneighborhood Any AbstractNeighborhood RadialNeighborhood{1}() nothing\nb Array, Tuple or Iterable of integers to match neighbors when cell is empty (3, 3) (0, 8)\ns Array, Tuple or Iterable of integers to match neighbors cell is full (2, 3) (0, 8)\n\n\n\n\n\n","category":"type"},{"location":"#Neighborhoods-1","page":"DynamicGrids.jl","title":"Neighborhoods","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"Neighborhoods define a pattern of cells surrounding the current cell,  and how they are combined to update the value of the current cell.","category":"page"},{"location":"#Types-and-Constructors-2","page":"DynamicGrids.jl","title":"Types and Constructors","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"AbstractNeighborhood\nRadialNeighborhood\nAbstractCustomNeighborhood\nCustomNeighborhood\nLayeredCustomNeighborhood","category":"page"},{"location":"#DynamicGrids.AbstractNeighborhood","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractNeighborhood","text":"abstract type AbstractNeighborhood\n\nNeighborhoods define how surrounding cells are related to the current cell. The neighbors function returns the sum of surrounding cells, as defined by the neighborhood.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.RadialNeighborhood","page":"DynamicGrids.jl","title":"DynamicGrids.RadialNeighborhood","text":"struct RadialNeighborhood{R} <: AbstractNeighborhood{R}\n\nRadial neighborhoods calculate the surrounding neighborood from the radius around the central cell. The central cell is ommitted.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.AbstractCustomNeighborhood","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractCustomNeighborhood","text":"abstract type AbstractCustomNeighborhood <: AbstractNeighborhood{R}\n\nCustom neighborhoods are tuples of custom coordinates in relation to the central point of the current cell. They can be any arbitrary shape or size.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.CustomNeighborhood","page":"DynamicGrids.jl","title":"DynamicGrids.CustomNeighborhood","text":"Allows completely arbitrary neighborhood shapes by specifying each coordinate specifically.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.LayeredCustomNeighborhood","page":"DynamicGrids.jl","title":"DynamicGrids.LayeredCustomNeighborhood","text":"Sets of custom neighborhoods that can have separate rules for each set.\n\n\n\n\n\n","category":"type"},{"location":"#Output-1","page":"DynamicGrids.jl","title":"Output","text":"","category":"section"},{"location":"#Output-Types-and-Constructors-1","page":"DynamicGrids.jl","title":"Output Types and Constructors","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"AbstractOutput\nArrayOutput\nREPLOutput","category":"page"},{"location":"#DynamicGrids.AbstractOutput","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractOutput","text":"abstract type AbstractOutput <: AbstractArray{T,1}\n\nAll outputs must inherit from AbstractOutput.\n\nSimulation outputs are decoupled from simulation behaviour and in many cases can be used interchangeably.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.ArrayOutput","page":"DynamicGrids.jl","title":"DynamicGrids.ArrayOutput","text":"A simple output that stores each step of the simulation in a vector of arrays.\n\nArguments:\n\nframes: Single init array or vector of arrays\ntstop: The length of the output.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.REPLOutput","page":"DynamicGrids.jl","title":"DynamicGrids.REPLOutput","text":"An output that is displayed directly in the REPL. It can either store or discard simulation frames.\n\nArguments:\n\nframes: Single init array or vector of arrays\n\nKeyword Arguments:\n\nfps::Real: frames per second to run at\nshowfps::Real: maximum displayed frames per second\nstore::Bool: store frames or not\ncolor: a color from Crayons.jl\ncutoff::Real: the cutoff point to display a full or empty cell. Default is 0.5\n\nTo choose the display type can pass :braile or :block to the constructor:\n\nREPLOutput{:block}(init)\n\nThe default option is :block.\n\n\n\n\n\n","category":"type"},{"location":"#Frame-processors-1","page":"DynamicGrids.jl","title":"Frame processors","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"AbstractFrameProcessor\nColorProcessor\nGreyscale","category":"page"},{"location":"#DynamicGrids.AbstractFrameProcessor","page":"DynamicGrids.jl","title":"DynamicGrids.AbstractFrameProcessor","text":"abstract type AbstractFrameProcessor\n\nFrame processors convert arrays into RGB24 images for display.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.ColorProcessor","page":"DynamicGrids.jl","title":"DynamicGrids.ColorProcessor","text":"struct ColorProcessor{S, Z, M} <: AbstractFrameProcessor\n\n\" Converts output frames to a colorsheme.\n\nArguments\n\nscheme: a ColorSchemes.jl colorscheme.\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.Greyscale","page":"DynamicGrids.jl","title":"DynamicGrids.Greyscale","text":"struct Greyscale{M1, M2}\n\nDefault colorscheme. Better performance than using a Colorschemes.jl scheme.\n\n\n\n\n\n","category":"type"},{"location":"#Overflow-1","page":"DynamicGrids.jl","title":"Overflow","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"AbstractOverflow\nWrapOverflow\nRemoveOverflow","category":"page"},{"location":"#DynamicGrids.WrapOverflow","page":"DynamicGrids.jl","title":"DynamicGrids.WrapOverflow","text":"struct WrapOverflow <: DynamicGrids.AbstractOverflow\n\nWrap cords that overflow boundaries back to the opposite side\n\n\n\n\n\n","category":"type"},{"location":"#DynamicGrids.RemoveOverflow","page":"DynamicGrids.jl","title":"DynamicGrids.RemoveOverflow","text":"struct RemoveOverflow <: DynamicGrids.AbstractOverflow\n\nRemove coords that overflow boundaries\n\n\n\n\n\n","category":"type"},{"location":"#Methods-1","page":"DynamicGrids.jl","title":"Methods","text":"","category":"section"},{"location":"#","page":"DynamicGrids.jl","title":"DynamicGrids.jl","text":"Modules = [DynamicGrids]\nOrder   = [:function]","category":"page"},{"location":"#DynamicGrids.resume!-Tuple{Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.resume!","text":"resume!(output, ruleset; tadd=100, kwargs...)\n\nRestart the simulation where you stopped last time. For arguments see sim!. The keyword arg tadd indicates the number of frames to add, and of course an init array will not be accepted.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.ruletypes-Tuple{Ruleset}","page":"DynamicGrids.jl","title":"DynamicGrids.ruletypes","text":"Return a tuple of the base types of the rules in the ruleset\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.savegif","page":"DynamicGrids.jl","title":"DynamicGrids.savegif","text":"savegif(filename::String, o::AbstractOutput, ruleset::AbstractRuleset; [processor=processor(o)], [kwargs...])\n\nWrite the output array to a gif. You must pass a processor keyword argument for any AbstractOutut objects not in AbstractImageOutput (which allready have a processor attached).\n\nSaving very large gifs may trigger a bug in Imagemagick.\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.sim!-Tuple{Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.sim!","text":"sim!(output, ruleset; init=nothing, tstop=length(output),       fps=fps(output), data=nothing, nreplicates=nothing)\n\nRuns the whole simulation, passing the destination aray to the passed in output for each time-step.\n\nArguments\n\noutput: An AbstractOutput to store frames or display them on the screen.\nruleset: A Rule() containing one ore more AbstractRule. These will each be run in sequence.\n\nKeyword Arguments\n\ninit: the initialisation array. If nothing, the Ruleset must contain an init array.\ntstop: the number of the frame the simulaiton will run to.\nfps: the frames per second to display. Will be taken from the output if not passed in.\nnreplicates: the number of replicates to combine in stochastic simulations\ndata: a SimData object. Can reduce allocations when that is important.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.addpadding-Union{Tuple{N}, Tuple{T}, Tuple{AbstractArray{T,N},Any}} where N where T","page":"DynamicGrids.jl","title":"DynamicGrids.addpadding","text":"Find the maximum radius required by all rules Add padding around the original init array, offset into the negative So that the first real cell is still 1, 1\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.applyrule","page":"DynamicGrids.jl","title":"DynamicGrids.applyrule","text":"applyrule(rule::AbstractRule, data, state, index)\n\nUpdates cell values based on their current state and the state of other cells as defined in the Rule.\n\nArguments:\n\nrule : AbstractRule\ndata : FrameData\nstate: the value of the current cell\nindex: a (row, column) tuple of Int for the current cell coordinates - t: the current time step\nargs: additional arguments passed through from user input to sim!\n\nReturns a value to be written to the current cell.\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.applyrule!","page":"DynamicGrids.jl","title":"DynamicGrids.applyrule!","text":"applyrule!(rule::AbstractPartialRule, data, state, index)\n\nA rule that manually writes to the dest array, used in rules inheriting from AbstractPartialRule.\n\nArguments:\n\nsee applyrule\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.applyrule-Tuple{Chain{#s102} where #s102<:(Tuple{#s101,Vararg{Any,N} where N} where #s101<:AbstractNeighborhoodRule),Any,Any,Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.applyrule","text":"applyrule(rules::Chain, data, state, (i, j))\n\nChained rules. If a Chain of rules is passed to applyrule, run them sequentially for each  cell.  This can have much beter performance as no writes occur between rules, and they are essentially compiled together into compound rules. This gives correct results only for AbstractCellRule, or for a single AbstractNeighborhoodRule followed by AbstractCellRule.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.applyrule-Tuple{Life,Any,Any,Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.applyrule","text":"rule(rule::AbstractLife, state)\n\nRule for game-of-life style cellular automata. This is a demonstration of  Cellular Automata more than a seriously optimised game of life rule.\n\nCells becomes active if it is empty and the number of neightbors is a number in the b array, and remains active the cell is active and the number of neightbors is in the s array.\n\nReturns: boolean\n\nExamples (gleaned from CellularAutomata.jl)\n\n# Life. \ninit = round.(Int64, max.(0.0, rand(-3.0:0.1:1.0, 300,300)))\noutput = REPLOutput{:block}(init; fps=10, color=:red)\nsim!(output, rule, init; time=1000)\n\n# Dimoeba\ninit = rand(0:1, 400, 300)\ninit[:, 100:200] .= 0\noutput = REPLOutput{:braile}(init; fps=25, color=:blue)\nsim!(output, Ruleset(Life(b=(3,5,6,7,8), s=(5,6,7,8))), init; time=1000)\n\n# Replicator\ninit = fill(1, 300,300)\ninit[:, 100:200] .= 0\ninit[10, :] .= 0\noutput = REPLOutput{:block}(init; fps=60, color=:yellow)\nsim!(output, Ruleset(Life(b=(1,3,5,7), s=(1,3,5,7))), init; time=1000)\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.frametoimage","page":"DynamicGrids.jl","title":"DynamicGrids.frametoimage","text":"Convert frame matrix to RGB24, using an AbstractFrameProcessor\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.handleoverflow!-Tuple{AbstractSimData,Integer}","page":"DynamicGrids.jl","title":"DynamicGrids.handleoverflow!","text":"Wrap overflow where required. This optimisation allows us to ignore bounds checks on neighborhoods and still use a wraparound grid.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.hoodsize-Tuple{Integer}","page":"DynamicGrids.jl","title":"DynamicGrids.hoodsize","text":"sizefromradius(radius)\n\nGet the size of a neighborhood dimension from its radius,  which is always 2r + 1.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.inbounds-Tuple{Tuple,Tuple,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.inbounds","text":"inbounds(x, max, overflow)\n\nCheck grid boundaries for a single coordinate and max value or a tuple of coorinates and max values.\n\nReturns a tuple containing the coordinate(s) followed by a boolean true if the cell is in bounds, false if not.\n\nOverflow of type RemoveOverflow returns the coordinate and false to skip coordinates that overflow outside of the grid. WrapOverflow returns a tuple with the current position or it's wrapped equivalent, and true as it is allways in-bounds.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.initframes!-Tuple{AbstractGraphicOutput,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.initframes!","text":"Frames are deleted and reallocated during the simulation, as performance is often display limited, and this allows runs of any length.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.initframes!-Tuple{AbstractOutput,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.initframes!","text":"Frames are preallocated and reused.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.maprule!-Tuple{AbstractSimData,AbstractRule}","page":"DynamicGrids.jl","title":"DynamicGrids.maprule!","text":"Apply the rule for each cell in the grid, using optimisations allowed for the supertype of the rule.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.maxradius-Tuple{Ruleset}","page":"DynamicGrids.jl","title":"DynamicGrids.maxradius","text":"Find the largest radius present in the passed in rules.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.neighbors","page":"DynamicGrids.jl","title":"DynamicGrids.neighbors","text":"neighbors(hood::AbstractNeighborhood, state, indices, t, source, args...)\n\nChecks all cells in neighborhood and combines them according to the particular neighborhood type.\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.neighbors-Tuple{AbstractCustomNeighborhood,Any,Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.neighbors","text":"neighbors(hood::AbstractCustomNeighborhood, buf, state)\n\nSum a single custom neighborhood.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.neighbors-Tuple{LayeredCustomNeighborhood,Any,Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.neighbors","text":"neighbors(hood::LayeredCustomNeighborhood, buf, state) Sum multiple custom neighborhoods separately.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.neighbors-Tuple{RadialNeighborhood,Any,Any,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.neighbors","text":"neighbors(hood::RadialNeighborhood, buf, state)\n\nSums moore nieghborhoods of any dimension. \n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.precalcrule!","page":"DynamicGrids.jl","title":"DynamicGrids.precalcrule!","text":"precalcrule!(rule, data)\n\nRun any precalculations needed to run a rule for a particular frame.\n\nIt may be better to do this in a functional way with an external precalc object passed into a rule via the data object, but it's done statefully for now for simplicity.\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.radius","page":"DynamicGrids.jl","title":"DynamicGrids.radius","text":"Return the radius of a rule or ruleset if it has one, otherwise zero.\n\n\n\n\n\n","category":"function"},{"location":"#DynamicGrids.runsim!-Tuple{Any,Vararg{Any,N} where N}","page":"DynamicGrids.jl","title":"DynamicGrids.runsim!","text":"run the simulation either directly or asynchronously.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.sequencerules!-Tuple{AbstractArray{#s14,1} where #s14<:SimData,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.sequencerules!","text":"Threaded replicate simulations. If nreplicates is set the data object will be a vector of replicate data, so we loop over it with threads.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.sequencerules!-Tuple{SimData,Ruleset}","page":"DynamicGrids.jl","title":"DynamicGrids.sequencerules!","text":"Iterate over all rules recursively, swapping source and dest arrays. Returns the data object with source and dest arrays ready for the next iteration.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.showframe-Tuple{AbstractOutput,Vararg{Any,N} where N}","page":"DynamicGrids.jl","title":"DynamicGrids.showframe","text":"showframe(output::AbstractOutput, [t])\n\nShow the last frame of the output, or the frame at time t.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.simdata-Tuple{AbstractRuleset,AbstractArray}","page":"DynamicGrids.jl","title":"DynamicGrids.simdata","text":"Generate simulation data to match a ruleset and init array.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.simloop!-NTuple{4,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.simloop!","text":"Loop over the selected timespan, running the ruleset and displaying the output\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.swapsource-Tuple{Any}","page":"DynamicGrids.jl","title":"DynamicGrids.swapsource","text":"Swap source and dest arrays. Allways returns regular SimData.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.updatestatus!-Tuple{Any}","page":"DynamicGrids.jl","title":"DynamicGrids.updatestatus!","text":"Initialise the block status array. This tracks whether anything has to be done in an area of the main array.\n\n\n\n\n\n","category":"method"},{"location":"#DynamicGrids.updatetime-Tuple{SimData,Any}","page":"DynamicGrids.jl","title":"DynamicGrids.updatetime","text":"Uptate timestamp\n\n\n\n\n\n","category":"method"}]
}
