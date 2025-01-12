# See interface docs
@inline inbounds(data::Union{GridData,AbstractSimData}, I::Tuple) = inbounds(data, I...)
@inline inbounds(data::Union{GridData,AbstractSimData}, I...) = 
    _inbounds(boundary(data), gridsize(data), I...)

@inline function _inbounds(boundary::BoundaryCondition, size::Tuple, i1, i2)
    a, inbounds_a = _inbounds(boundary, size[1], i1)
    b, inbounds_b = _inbounds(boundary, size[2], i2)
    (a, b), inbounds_a & inbounds_b
end
@inline _inbounds(::Remove, size::Number, i::Number) = i, _isinbounds(size, i)
@inline function _inbounds(::Wrap, size::Number, i::Number)
    if i < oneunit(i)
        size + rem(i, size), true
    elseif i > size
        rem(i, size), true
    else
        i, true
    end
end

# See interface docs
@inline isinbounds(data::Union{GridData,AbstractSimData}, I::Tuple) = isinbounds(data, I...)
@inline isinbounds(data::Union{GridData,AbstractSimData}, I...) = _isinbounds(gridsize(data), I...)

@inline _isinbounds(size::Tuple, I...) = all(map(_isinbounds, size, I))
@inline _isinbounds(size, i) = i >= one(i) && i <= size


# _updateboundary
# Reset or wrap boundary where required. This allows us to ignore 
# bounds checks on neighborhoods and still use a wraparound grid.
_updateboundary!(grids::Tuple) = map(_updateboundary!, grids)
function _updateboundary!(g::GridData{S,R}) where {S<:Tuple{Y,X},R} where {Y,X}
    R < 1 && return g
    return _updateboundary!(g, boundary(g))
end
function _updateboundary!(g::GridData{S,R}, ::Remove) where {S<:Tuple{Y,X},R} where {Y,X}
    src = parent(source(g))
    # Left
    @inbounds src[1:Y, 1:R] .= Ref(padval(g))
    # Right
    @inbounds src[1:Y, X+R+1:X+2R] .= Ref(padval(g))
    # Top middle
    @inbounds src[1:R, R+1:X+R] .= Ref(padval(g))
    # Bottom middle
    @inbounds src[Y+R+1:Y+2R, R+1:X+R] .= Ref(padval(g))
    status = sourcestatus(g)
    return g
end
function _updateboundary!(g::GridData{S,R}, ::Wrap) where {S<:Tuple{Y,X},R} where {Y,X}
    src = parent(source(g))
    nrows, ncols = gridsize(g)
    startpadrow = startpadcol = 1:R
    endpadrow = nrows+R+1:nrows+2R
    endpadcol = ncols+R+1:ncols+2R
    startrow = startcol = 1+R:2R
    endrow = nrows+1:nrows+R
    endcol = ncols+1:ncols+R
    rows = 1+R:nrows+R
    cols = 1+R:ncols+R

    # Sides ---
    # Left
    @inbounds copyto!(src, CartesianIndices((rows, startpadcol)),
                      src, CartesianIndices((rows, endcol)))
    # Right
    @inbounds copyto!(src, CartesianIndices((rows, endpadcol)),
                      src, CartesianIndices((rows, startcol)))
    # Top
    @inbounds copyto!(src, CartesianIndices((startpadrow, cols)),
                      src, CartesianIndices((endrow, cols)))
    # Bottom
    @inbounds copyto!(src, CartesianIndices((endpadrow, cols)),
                      src, CartesianIndices((startrow, cols)))

    # Corners ---
    # Top Left
    @inbounds copyto!(src, CartesianIndices((startpadrow, startpadcol)),
                      src, CartesianIndices((endrow, endcol)))
    # Top Right
    @inbounds copyto!(src, CartesianIndices((startpadrow, endpadcol)),
                      src, CartesianIndices((endrow, startcol)))
    # Botom Left
    @inbounds copyto!(src, CartesianIndices((endpadrow, startpadcol)),
                      src, CartesianIndices((startrow, endcol)))
    # Botom Right
    @inbounds copyto!(src, CartesianIndices((endpadrow, endpadcol)),
                      src, CartesianIndices((startrow, startcol)))

    _wrapstatus!(sourcestatus(g))
    return g
end

# _wrapstatus!
# Copies status from opposite sides/corners in Wrap boundary mode
_wrapstatus!(status::Nothing) = nothing
function _wrapstatus!(status::AbstractArray)
    # !!! The end row/column is always empty !!!
    # Its padding for block opt. So we work with end-1 and end-2
    
    # This could be further optimised by not copying the end-2 
    # block column/row when the blocks are aligned at both ends.
    
    # Sides
    status[1, :] .|= status[end-1, :] .| status[end-2, :]
    status[:, 1] .|= status[:, end-1] .| status[:, end-2]
    status[end-1, :] .|= status[1, :]
    status[:, end-1] .|= status[:, 1]
    status[end-2, :] .|= status[1, :]
    status[:, end-2] .|= status[:, 1]

    # Corners
    status[1, 1] |= status[end-1, end-1] | status[end-2, end-1] | 
                    status[end-1, end-2] | status[end-2, end-2]
    status[end-1, 1] |= status[1, end-1] | status[1, end-2]
    status[end-2, 1] |= status[1, end-1] | status[1, end-2]
    status[1, end-1] |= status[end-1, 1] | status[end-2, 1]
    status[1, end-2] |= status[end-1, 1] | status[end-2, 1]
    status[end-1, end-1] |= status[1, 1] 
    status[end-2, end-2] |= status[1, 1] 
end
