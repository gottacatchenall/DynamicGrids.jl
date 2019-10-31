"""
Outputs that display the simulation frames live.
"""
abstract type AbstractGraphicOutput{T} <: AbstractOutput{T} end

(::Type{F})(o::T; kwargs...) where F <: AbstractGraphicOutput where T <: AbstractGraphicOutput =
    F(; frames=frames(o), starttime=starttime(o), endtime=endtime(o), 
      fps=fps(o), showfps=showfps(o), timestamp=timestamp(o), stampframe=stampframe(o), store=store(o),
      kwargs...)

"""
Mixin for graphic output fields
"""
@premix @default_kw struct Graphic{FPS,SFPS,TS,SF}
    fps::FPS       | 25.0
    showfps::SFPS  | 25.0
    timestamp::TS  | 0.0
    stampframe::SF | 1
    store::Bool    | false
end

# Field getters and setters
fps(o::AbstractGraphicOutput) = o.fps
setfps!(o::AbstractGraphicOutput, x) = o.fps = x
showfps(o::AbstractGraphicOutput) = o.showfps
timestamp(o::AbstractGraphicOutput) = o.timestamp
stampframe(o::AbstractGraphicOutput) = o.stampframe
isstored(o::AbstractGraphicOutput) = o.store

settimestamp!(o::AbstractGraphicOutput, f) = begin
    o.timestamp = time()
    o.stampframe = f
end

# Output interface
# Delay output to maintain the frame rate
delay(o::AbstractGraphicOutput, f) = 
    sleep(max(0.0, timestamp(o) + (f - stampframe(o))/fps(o) - time()))
isshowable(o::AbstractGraphicOutput, f) = true # TODO working max fps. o.timestamp + (t - tlast(o))/o.maxfps < time()


"""
Frames are deleted and reallocated during the simulation,
which this allows runs of any length.
"""
initframes!(o::AbstractGraphicOutput, init) = begin
    deleteat!(frames(o), 1:length(o))
    push!(frames(o), deepcopy(init))
end
initframes!(o::AbstractGraphicOutput, init::NamedTuple) = begin
    deleteat!(frames(o), 1:length(o))
    push!(frames(o), deepcopy(init))
end


storeframe!(o::AbstractGraphicOutput, data) = begin
    f = currentframe(data)
    if isstored(o)
        push!(o, map(l -> fill!(similar(l), zero(eltype(l))), o[1]))
        storeframe!(o, data, f)
    else
        map(l -> fill!(l, zero(eltype(l))), o[1])
        storeframe!(o, data, 1)
    end
    isshowable(o, f) && showframe(o, data, f)
end

showframe(o::AbstractGraphicOutput, data::AbstractSimData) = 
    showframe(o, data, lastindex(o))
showframe(o::AbstractGraphicOutput, data::AbstractSimData, f) = 
    showframe(o[frameindex(o, f)], o, data, f)
showframe(o::AbstractGraphicOutput, data::AbstractVector{<:AbstractSimData}, f) = 
    showframe(o, data[1], f)
showframe(frame, o::AbstractGraphicOutput, data::AbstractSimData, f) = 
    showframe(frame, o, f)
showframe(o::AbstractGraphicOutput, f=firstindex(o)) = showframe(o[f], o, f)
